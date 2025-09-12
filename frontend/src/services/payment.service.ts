import api from './api';

export type PaymentType = 'booking' | 'extension';

export const initiatePayment = async (bookingId: string, paymentMethod: string, type: PaymentType = 'booking') => {
  try {
    const response = await api.post(`/api/payment/initiate`, {
      bookingId,
      paymentMethod,
      type,
    });

    if (!response) {
      throw new Error('Failed to initiate payment');
    }

    return response.data;
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};

export const verifyPayment = async (transactionId: string) => {
  try {
    const response = await api.get(`/api/payment/verify/${transactionId}`);

    if (!response) {
      throw new Error('Failed to verify payment');
    }

    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}; 