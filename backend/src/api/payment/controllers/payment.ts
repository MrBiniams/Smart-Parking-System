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
        success: true,
        payment: paymentResult
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return ctx.internalServerError('Error verifying payment');
    }
  }
}; 