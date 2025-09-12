import axios from 'axios';

export default ({ strapi }) => ({
  async initiatePayment(transaction) {
    try {
      const telebirrConfig = {
        apiKey: process.env.TELEBIRR_API_KEY,
        merchantId: process.env.TELEBIRR_MERCHANT_ID,
        apiUrl: process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/api/v1',
      };

      // Prepare payment request
      const paymentRequest = {
        merchantId: telebirrConfig.merchantId,
        amount: transaction.amount,
        currency: transaction.currency,
        description: `Parking booking payment for booking #${transaction.metadata.bookingId}`,
        callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/status`,
        transactionId: transaction.transactionId,
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

      return {
        paymentUrl: response.data.paymentUrl,
        providerTransactionId: response.data.providerTransactionId
      };
    } catch (error) {
      console.error('Telebirr payment initiation error:', error);
      throw error;
    }
  },

  async verifyPayment(transaction) {
    try {
      const telebirrConfig = {
        apiKey: process.env.TELEBIRR_API_KEY,
        merchantId: process.env.TELEBIRR_MERCHANT_ID,
        apiUrl: process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/api/v1',
      };

      // Verify payment with Telebirr
      const response = await axios.get(
        `${telebirrConfig.apiUrl}/payment/verify/${transaction.transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${telebirrConfig.apiKey}`,
          },
        }
      );

      return {
        status: response.data.status,
        providerResponse: response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Telebirr payment verification error:', error);
      throw error;
    }
  }
}); 