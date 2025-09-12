export default ({ strapi }) => ({
  async processPayment(bookingId: string, amount: number, paymentMethod: string) {
    try {
      // Get booking details
      const booking = await strapi.entityService.findOne('api::booking.booking', bookingId, {
        populate: ['user', 'slot']
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate transaction ID
      const transactionId = `BOOKING-${bookingId}-${Date.now()}`;

      // Create transaction record
      const transaction = await strapi.entityService.create('api::transaction.transaction', {
        data: {
          transactionId,
          booking: bookingId,
          amount,
          currency: 'ETB',
          paymentMethod,
          status: 'pending',
          metadata: {
            bookingId,
            customerName: booking.user.username,
            customerEmail: booking.user.email,
            customerPhone: booking.user.phone,
            slotId: booking.slot.id,
            locationId: booking.slot.location
          }
        }
      });

      // Update booking with transaction
      await strapi.entityService.update('api::booking.booking', booking.id, {
        data: {
          paymentMethod,
          paymentStatus: 'pending',
          transaction: transaction.id,
          totalPrice: amount,
          publishedAt: new Date()
        }
      });

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod) {
        case 'telebirr':
          paymentResult = await strapi.service('api::payment.telebirr').initiatePayment(transaction);
          break;
        case 'cbe-birr':
          paymentResult = await strapi.service('api::payment.cbe-birr').initiatePayment(transaction);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      return {
        success: true,
        transactionId: transaction.transactionId,
        ...paymentResult
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  },

  async verifyPayment(transactionId: string) {
    try {
      // Find transaction
      const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
        filters: {
          transactionId: transactionId
        },
        populate: ['booking']
      });

      const transaction = transactions[0];
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify payment based on method
      let verificationResult;
      switch (transaction.paymentMethod) {
        case 'telebirr':
          verificationResult = await strapi.service('api::payment.telebirr').verifyPayment(transaction);
          break;
        case 'cbe-birr':
          verificationResult = await strapi.service('api::payment.cbe-birr').verifyPayment(transaction);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Update transaction status
      await strapi.entityService.update('api::transaction.transaction', transaction.id, {
        data: {
          status: verificationResult.status === 'success' ? 'completed' : 'failed',
          paymentProviderResponse: verificationResult.providerResponse,
          errorMessage: verificationResult.status !== 'success' ? verificationResult.message : null,
          publishedAt: new Date()
        }
      });

      // Update booking status
      if (transaction.booking) {
        await strapi.entityService.update('api::booking.booking', transaction.booking.id, {
          data: {
            paymentStatus: verificationResult.status === 'success' ? 'paid' : 'failed',
            bookingStatus: verificationResult.status === 'success' ? 'confirmed' : 'pending',
            publishedAt: new Date()
          }
        });
      }

      return {
        success: true,
        status: verificationResult.status,
        transaction
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
}); 