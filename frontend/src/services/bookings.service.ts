import { Booking, CreateBookingData } from '@/types';
import api from './api';

export interface BookingResponse {
  booking: {
    id: number;
    plateNumber: string;
    slotId: number;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: string;
  };
  paymentUrl?: string;
}

export const getUserBookings = async (): Promise<Booking[]> => {
  try {
    const response = await api.get(`/api/bookings/mybookings/me`);
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

export const createBooking = async (bookingData: CreateBookingData): Promise<BookingResponse> => {
  try {
    const response = await api.post(`/api/bookings`, bookingData);

    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const extendBooking = async (booking: Booking, extendedTime: number) => {
  const response = await api.post(`/api/bookings/${booking.documentId}/extend`, { extendedTime: extendedTime, slotId: booking.slot.documentId });
  return response.data?.booking;
};

export const initiatePayment = async (bookingId: string, amount: number) => {
  const response = await api.post(`/api/payments/initiate`, {
    bookingId,
    amount,
    type: 'extension'
  });
  return response.data;
};

export const verifyPayment = async (transactionId: string) => {
  try {
    const response = await api.post(
      `/api/payment/verify`,
      { transactionId }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 