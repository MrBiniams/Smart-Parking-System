import axios from 'axios';

export default ({ strapi }) => ({
  async initiatePayment(transaction) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate a simulated payment URL
      const paymentUrl = `${process.env.FRONTEND_URL}/payment/simulate?paymentId=${transaction.documentId}`;

      // Simulate provider response
      const providerResponse = {
        providerTransactionId: `SIM-${Date.now()}`,
        reference: `REF-${Math.random().toString(36).substr(2, 9)}`,
        paymentUrl,
        status: 'pending'
      };

      // Update transaction with simulated provider response
      await strapi.entityService.update('api::payment.payment', transaction.id, {
        data: {
          paymentProviderResponse: providerResponse,
          paymentProviderTransactionId: providerResponse.providerTransactionId,
          paymentProviderReference: providerResponse.reference,
          publishedAt: new Date()
        }
      });

      return {
        paymentUrl,
        providerTransactionId: providerResponse.providerTransactionId
      };
    } catch (error) {
      console.error('Telebirr simulator payment initiation error:', error);
      throw error;
    }
  },

  async verifyPayment(paymentId) {
    try {
      const payments = await strapi.entityService.findMany('api::payment.payment', {
        filters: {
          documentId: paymentId
        },
        populate: ['booking']
      });

      const payment = payments[0];

      if (!payment) {
        throw new Error('Payment not found');
      }
      // Simulate successful payment verification
      const response = {
        status: 'success',
        message: 'Payment verified successfully',
        paymentId: payment.documentId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
        timestamp: new Date().toISOString(),
        paymentMethod: "Telebirr-simulator",

      };

      return {
        status: 'success',
        data: response,
        message: 'Payment verified successfully'
      };
    } catch (error) {
      console.error('Telebirr simulator payment verification error:', error);
      throw error;
    }
  }
}); 