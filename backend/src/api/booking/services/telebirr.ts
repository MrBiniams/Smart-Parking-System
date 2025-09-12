import axios from 'axios';

export default ({ strapi }) => ({
  async initiatePayment(bookingId: string, amount: number) {
    try {
      // Get booking details
      const booking = await strapi.entityService.findOne('api::booking.booking', bookingId, {
        populate: ['user']
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Telebirr API configuration
      const telebirrConfig = {
        apiKey: process.env.TELEBIRR_API_KEY,
        merchantId: process.env.TELEBIRR_MERCHANT_ID,
        apiUrl: process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/api/v1',
      };

      // Generate transaction ID
      const transactionId = `BOOKING-${bookingId}-${Date.now()}`;

      // Create transaction record
      const transaction = await strapi.entityService.create('api::transaction.transaction', {
        data: {
          transactionId,
          booking: bookingId,
          amount,
          currency: 'ETB',
          paymentMethod: 'telebirr',
          status: 'pending',
          metadata: {
            bookingId,
            customerName: booking.user.username,
            customerEmail: booking.user.email,
            customerPhone: booking.user.phone
          }
        }
      });

      // Prepare payment request
      const paymentRequest = {
        merchantId: telebirrConfig.merchantId,
        amount: amount,
        currency: 'ETB',
        customerPhone: booking.user.phone || '',
        customerEmail: booking.user.email,
        customerName: booking.user.username,
        description: `Parking booking payment for booking #${bookingId}`,
        callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/status`,
        transactionId: transactionId,
      };

      // Make API call to Telebirr
      const response = await axios.post(
        `${telebirrConfig.apiUrl}/payment/initiate`,
        paymentRequest,
        {
          headers: {
            'Authorization': `Bearer ${telebirrConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update transaction with provider response
      await strapi.entityService.update('api::transaction.transaction', transaction.id, {
        data: {
          paymentProviderResponse: response.data,
          paymentProviderTransactionId: response.data.providerTransactionId,
          paymentProviderReference: response.data.reference,
          publishedAt: new Date()
        }
      });

      // Update booking with payment details
      await strapi.entityService.update('api::booking.booking', bookingId, {
        data: {
          paymentMethod: 'telebirr',
          paymentStatus: 'pending',
          transaction: transaction.id,
          publishedAt: new Date()
        }
      });

      return {
        success: true,
        paymentUrl: response.data.paymentUrl,
        transactionId: transactionId
      };
    } catch (error) {
      console.error('Telebirr payment initiation error:', error);
      throw error;
    }
  },

  async verifyPayment(paymentId: string) {
    try {
      const telebirrConfig = {
        apiKey: process.env.TELEBIRR_API_KEY,
        merchantId: process.env.TELEBIRR_MERCHANT_ID,
        apiUrl: process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/api/v1',
      };

      // Find transaction
      const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
        filters: {
          documentId: paymentId
        },
        populate: ['booking']
      });

      const transaction = transactions[0];
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify payment with Telebirr
      const response = await axios.get(
        `${telebirrConfig.apiUrl}/payment/verify/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${telebirrConfig.apiKey}`,
          },
        }
      );

      // Update transaction status
      await strapi.entityService.update('api::transaction.transaction', transaction.id, {
        data: {
          status: response.data.status === 'success' ? 'completed' : 'failed',
          paymentProviderResponse: response.data,
          errorMessage: response.data.status !== 'success' ? response.data.message : null,
          publishedAt: new Date()
        }
      });

      // Update booking status
      if (transaction.booking) {
        await strapi.entityService.update('api::booking.booking', transaction.booking.id, {
          data: {
            paymentStatus: response.data.status === 'success' ? 'paid' : 'failed',
            bookingStatus: response.data.status === 'success' ? 'confirmed' : 'pending',
            publishedAt: new Date()
          }
        });
      }

      return {
        success: true,
        status: response.data.status,
        transaction
      };
    } catch (error) {
      console.error('Telebirr payment verification error:', error);
      throw error;
    }
  }
}); 