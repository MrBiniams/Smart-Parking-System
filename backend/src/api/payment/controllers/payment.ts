export default {
  async initiate(ctx) {
    try {
      const { bookingId, paymentMethod } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        ctx.throw(401, 'Not authenticated');
      }
      
      const userId = user.documentId;
      // Validate required fields
      if (!bookingId || !paymentMethod) {
        return ctx.badRequest('Booking ID and payment method are required');
      }

      // Validate payment method
      const validPaymentMethods = ['telebirr', 'cbe-birr'];
      const normalizedPaymentMethod = paymentMethod.toLowerCase();
      if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
        return ctx.badRequest('Invalid payment method');
      }

      // Get booking details
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          documentId: bookingId
        },
        populate: ['user', 'slot']
      });

      const booking = bookings[0];

      if (!booking || !booking.slot) {
        return ctx.badRequest('Booking not found');
      }
      // Check if booking belongs to user
      if (booking.user.documentId !== userId) {
        return ctx.badRequest('Unauthorized');
      }

      // Check if payment already exists
      const existingPayment = await strapi.entityService.findMany('api::payment.payment', {
        filters: {
          booking: bookingId
        }
      });

      if (existingPayment.length > 0) {
        return ctx.badRequest('Payment already exists for this booking');
      }

      // Generate transaction ID
      const transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record
      const payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          amount: booking.totalPrice,
          currency: 'ETB',
          status: 'pending',
          transactionId,
          paymentMethod: normalizedPaymentMethod,
          booking: bookingId,
          customerPhone: booking.user.phone,
          customerEmail: booking.user.email,
          customerName: `${booking.user.firstname} ${booking.user.lastname}`,
          metadata: {
            bookingId,
            slotId: booking.slot.documentId
          },
          publishedAt: new Date()
        }
      });

      // Get payment provider service
      let paymentProvider;
      if (process.env.NODE_ENV === 'development' && normalizedPaymentMethod === 'telebirr') {
        // Use simulator in development mode for TeleBirr
        paymentProvider = strapi.service('api::payment.telebirr-simulator');
      } else {
        // Use real payment provider
        switch (normalizedPaymentMethod) {
          case 'telebirr':
            paymentProvider = strapi.service('api::payment.telebirr');
            break;
          case 'cbe-birr':
            paymentProvider = strapi.service('api::payment.cbe-birr');
            break;
          default:
            return ctx.badRequest('Invalid payment method');
        }
      }

      if (!paymentProvider) {
        return ctx.badRequest('Payment provider not available');
      }
      // Initiate payment with provider
      const paymentResult = await paymentProvider.initiatePayment(payment);

      return {
        success: true,
        payment: {
          id: payment.documentId,
          amount: payment.amount,
          status: payment.status,
          paymentUrl: paymentResult.paymentUrl
        }
      };
    } catch (error) {
      console.error('Payment initiation error:', error);
      return ctx.internalServerError('Error initiating payment');
    }
  },
  async verify(ctx) {
    try {
      const { paymentId } = ctx.request.params;
      const payments = await strapi.entityService.findMany('api::payment.payment', {
        filters: {
          documentId: paymentId
        },
        populate: ['booking']
      });

      const payment = payments[0];
      
      if (!payment) {
        return ctx.badRequest('Payment not found');
      }

      // Get payment provider service
      let paymentProvider;
      if (process.env.NODE_ENV === 'development' && payment.paymentMethod === 'telebirr') {
        // Use simulator in development mode for TeleBirr
        paymentProvider = strapi.service('api::payment.telebirr-simulator');
      } else {
        // Use real payment provider
        switch (payment.paymentMethod) {
          case 'telebirr':
            paymentProvider = strapi.service('api::payment.telebirr');
            break;
          case 'cbe-birr':
            paymentProvider = strapi.service('api::payment.cbe-birr');
            break;
          default:
            return ctx.badRequest('Invalid payment method');
        }
      }

      if (!paymentProvider) {
        return ctx.badRequest('Payment provider not available');
      }

      // Verify payment with provider 
      const paymentResult = await paymentProvider.verifyPayment(paymentId);

      // If payment is successful, update related entities
      if (paymentResult.status === 'success') {
        // Update payment status
        await strapi.entityService.update('api::payment.payment', payment.id, {
          data: {
            status: 'completed',
            paymentProviderResponse: paymentResult.data,
            publishedAt: new Date()
          } as any
        });

        // Get booking with populated slot
        const bookings = await strapi.entityService.findMany('api::booking.booking', {
          filters: {
            documentId: payment.booking.documentId
          },
          populate: ['slot']
        });

        const booking = bookings[0];

        if (booking) {
          // Update booking status
          await strapi.entityService.update('api::booking.booking', booking.id, {
            data: {
              bookingStatus: 'active',
              paymentStatus: 'paid',
              publishedAt: new Date()
            } as any,
            populate: []
          });

          // Update slot status if it exists
          if (booking.slot) {
            await strapi.entityService.update('api::slot.slot', booking.slot.id, {
              data: {
                slotStatus: 'occupied',
                publishedAt: new Date()
              } as any,
              populate: []
            });
          }
        }
      }

      return {
        payment: paymentResult
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return ctx.internalServerError('Error verifying payment');
    }
  },

  async createAttendantPayment(ctx) {
    try {
      console.log('=== ATTENDANT PAYMENT: Creating manual payment ===');
      console.log('Request body:', ctx.request.body);
      
      // Standard Strapi JWT authentication
      const attendantId = ctx.state.user?.id;
      const attendantDocumentId = ctx.state.user?.documentId;
      
      console.log('User ID from Strapi JWT:', attendantId);
      console.log('User documentId from Strapi JWT:', attendantDocumentId);

      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details with their assigned location - follow same pattern as findAttendantBookings
      let attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
        populate: ['role', 'location'],
      });
      
      // If not found with numeric ID, try with documentId
      if (!attendant && attendantDocumentId) {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role', 'location'],
        });
      }

      if (!attendant) {
        return ctx.unauthorized('Attendant not found');
      }

      if (attendant.role.name !== 'Attendant') {
        return ctx.forbidden('Only attendants can access this endpoint');
      }

      // Check if attendant has an assigned location
      if (!attendant.location) {
        return ctx.badRequest('Attendant has no assigned location');
      }

      // Validate required fields
      const { plateNumber, amount, paymentMethod, notes } = ctx.request.body;
      
      if (!plateNumber || !amount || !paymentMethod) {
        return ctx.badRequest('Missing required fields: plateNumber, amount, paymentMethod');
      }

      // Validate amount is positive number
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return ctx.badRequest('Amount must be a positive number');
      }

      // Validate payment method
      const validMethods = ['cash', 'pos', 'telebirr'];
      if (!validMethods.includes(paymentMethod)) {
        return ctx.badRequest('Invalid payment method');
      }

      // Generate unique transaction ID
      const transactionId = `ATTENDANT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record with automatic location assignment
      const payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          amount: numAmount,
          currency: 'ETB',
          status: 'completed', // Attendant payments are immediately completed
          transactionId,
          paymentMethod,
          plateNumber,
          description: notes || `${paymentMethod.toUpperCase()} payment processed by attendant for vehicle ${plateNumber}`,
          attendant: attendantId,
          location: attendant.location.id, // AUTOMATIC LOCATION ASSIGNMENT!
          metadata: {
            type: 'attendant_manual',
            plateNumber,
            processedBy: `${attendant.firstName} ${attendant.lastName}`,
            locationName: attendant.location.name,
            timestamp: new Date().toISOString()
          },
          customerName: `Manual Entry - ${plateNumber}`,
          publishedAt: new Date()
        }
      });

      console.log('=== ATTENDANT PAYMENT: Payment created successfully ===');
      console.log('Payment ID:', payment.documentId);
      console.log('Amount:', payment.amount);
      console.log('Location:', attendant.location.name);
      console.log('Plate:', payment.plateNumber);
      console.log('===============================================');

      return {
        success: true,
        data: payment,
        message: `Payment of ${numAmount} ETB processed successfully for vehicle ${plateNumber}`
      };
    } catch (error) {
      console.error('=== ATTENDANT PAYMENT: Error ===');
      console.error('Error:', error);
      console.log('===============================================');
      return ctx.internalServerError('Error processing payment');
    }
  },

  async getAttendantRecentPayments(ctx) {
    try {
      console.log('=== ATTENDANT PAYMENTS: Getting recent payments ===');
      
      // Standard Strapi JWT authentication
      const attendantId = ctx.state.user?.id;
      const attendantDocumentId = ctx.state.user?.documentId;
      
      console.log('User ID from Strapi JWT:', attendantId);
      console.log('User documentId from Strapi JWT:', attendantDocumentId);

      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details with their assigned location - follow same pattern as findAttendantBookings
      let attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
        populate: ['role', 'location'],
      });
      
      // If not found with numeric ID, try with documentId
      if (!attendant && attendantDocumentId) {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role', 'location'],
        });
      }

      if (!attendant) {
        return ctx.unauthorized('Attendant not found');
      }

      if (attendant.role.name !== 'Attendant') {
        return ctx.forbidden('Only attendants can access this endpoint');
      }

      // Check if attendant has an assigned location
      if (!attendant.location) {
        return ctx.badRequest('Attendant has no assigned location');
      }

      console.log('Getting payments for location:', attendant.location?.name);
      console.log('Attendant location ID:', attendant.location?.id);

      // Get payments ONLY for this attendant's location
      let payments;
      try {
        console.log('=== FETCHING LOCATION-FILTERED PAYMENTS ===');
        console.log('Filtering by location ID:', attendant.location.id);
        
        // Query payments filtered by attendant's location
        payments = await strapi.entityService.findMany('api::payment.payment', {
          filters: {
            location: {
              id: attendant.location.id
            }
          },
          populate: ['attendant', 'booking', 'booking.user', 'location'],
          sort: { createdAt: 'desc' },
          limit: 50 // Get recent 50 payments for this location only
        });
        
        console.log('Found payments for', attendant.location.name + ':', payments?.length || 0);
        
        // Log first payment for debugging (if exists)
        if (payments && payments.length > 0) {
          console.log('Sample payment from location:', {
            id: payments[0].id,
            amount: payments[0].amount,
            plateNumber: payments[0].plateNumber,
            locationName: payments[0].location?.name,
            attendantName: payments[0].attendant ? `${payments[0].attendant.firstName} ${payments[0].attendant.lastName}` : 'Customer Payment'
          });
        }
        
      } catch (queryError) {
        console.error('=== PAYMENT QUERY ERROR ===');
        console.error('Query error:', queryError);
        throw queryError;
      }

      console.log('Found payments:', payments.length);

      // Format payments for frontend
      const formattedPayments = payments.map(payment => ({
        id: payment.id,
        documentId: payment.documentId,
        plateNumber: payment.plateNumber || payment.booking?.plateNumber || 'Unknown',
        amount: payment.amount,
        method: payment.paymentMethod,
        timestamp: payment.createdAt,
        type: payment.metadata?.type || (payment.isOverstayPayment ? 'overstay' : 'regular'),
        status: payment.status,
        attendantName: payment.attendant ? 
          `${payment.attendant.firstName || ''} ${payment.attendant.lastName || ''}`.trim() : 
          null,
        customerName: payment.customerName || 
          (payment.booking?.user ? 
            `${payment.booking.user.firstName || ''} ${payment.booking.user.lastName || ''}`.trim() : 
            'Unknown'),
        receiptNumber: payment.receiptNumber,
        description: payment.description
      }));

      console.log('=== ATTENDANT PAYMENTS: Retrieved successfully ===');
      console.log('Total payments:', formattedPayments.length);
      console.log('Location:', attendant.location.name);
      console.log('===============================================');

      return {
        success: true,
        data: formattedPayments,
        meta: {
          assignedLocation: {
            id: attendant.location.id,
            documentId: attendant.location.documentId,
            name: attendant.location.name
          },
          totalCount: formattedPayments.length
        }
      };
    } catch (error) {
      console.error('=== ATTENDANT PAYMENTS: Error getting recent payments ===');
      console.error('Error:', error);
      console.log('=====================================================');
      return ctx.internalServerError('Error retrieving recent payments');
    }
  }
};