'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/services/payment.service';
import { useUserStore } from '@/store/user';
import { formatDistanceToNow } from 'date-fns';

interface Booking {
  id: string;
  plateNumber: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingStatus: string;
  slot: {
    name: string;
    location: {
      name: string;
    };
  };
}

export default function PaymentVerificationPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useUserStore();
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!transactionId || !token) return;

      try {
        const response = await verifyPayment(transactionId);
        
        if (response.success) {
          setStatus('success');
          if (response.transaction?.booking) {
            setBooking(response.transaction.booking);
          }
        } else {
          setStatus('failed');
          setError('Payment verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setError('Failed to verify payment. Please try again.');
      }
    };

    checkPaymentStatus();
  }, [transactionId, token]);

  const handleReturnHome = () => {
    router.push('/');
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{error || 'Your payment could not be processed.'}</p>
          <button
            onClick={handleReturnHome}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Your booking has been confirmed.</p>
            </div>

            {booking && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Booking Details</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plate Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{booking.plateNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{booking.slot.location.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Slot</dt>
                    <dd className="mt-1 text-sm text-gray-900">{booking.slot.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">{booking.totalPrice} ETB</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(booking.startTime).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(booking.endTime).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Remaining Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDistanceToNow(new Date(booking.endTime), { addSuffix: true })}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={handleReturnHome}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 