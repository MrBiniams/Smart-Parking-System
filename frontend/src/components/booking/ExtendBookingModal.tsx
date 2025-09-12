import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { extendBooking } from '@/services/bookings.service';
import PaymentModal from '../payment/PaymentModal';

interface ExtendBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onExtend: (hours: number) => void;
}

export default function ExtendBookingModal({ isOpen, onClose, booking, onExtend }: ExtendBookingModalProps) {
  const [hours, setHours] = useState(1);
  const [newEndTime, setNewEndTime] = useState(dayjs(booking.endTime));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionCost, setExtensionCost] = useState<number | null>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [extendedBooking, setExtendedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHours(1);
      setNewEndTime(dayjs(booking.endTime));
      setError(null);
      // Calculate initial extension cost
      const initialCost = (booking.slot.price || 0) * 1; // 1 hour default
      setExtensionCost(initialCost);
    }
  }, [isOpen, booking.endTime, booking.slot.price]);

  const handleHoursChange = (value: number) => {
    const newValue = Math.min(24, Math.max(1, value));
    setHours(newValue);
    setNewEndTime(dayjs(booking.endTime).add(newValue, 'hour'));
    // Calculate extension cost based on the slot's hourly rate
    const cost = (booking.slot.price || 0) * newValue;
    setExtensionCost(cost);
  };

  const handleExtend = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First, get the extension details and cost
      const extension = await extendBooking(booking, hours);

      // Handle the payment response
      if (extension) {
        setExtendedBooking(extension);
        setShowPaymentModal(true);

      } else {
        // Payment was successful or not required
        onExtend(hours);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend booking');
      console.error('Error extending booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    onExtend(hours);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 w-full max-w-md shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Extend Booking</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Current End Time
              </label>
              <div className="text-sm text-gray-900 font-medium">
                {dayjs(booking.endTime).format('MMM D, YYYY h:mm A')}
              </div>
            </div>

            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-900 mb-1">
                Extension Duration (1-24 hours)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHoursChange(hours - 1)}
                  disabled={hours <= 1 || isLoading}
                  className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    hours <= 1 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  id="hours"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => handleHoursChange(parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                  className="block w-20 text-center border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleHoursChange(hours + 1)}
                  disabled={hours >= 24 || isLoading}
                  className={`p-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                    hours >= 24 || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                New End Time
              </label>
              <div className="text-sm text-gray-900 font-medium">
                {newEndTime.format('MMM D, YYYY h:mm A')}
              </div>
            </div>

            {extensionCost !== null && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Extension Cost
                </label>
                <div className="text-sm text-gray-900 font-medium">
                  {extensionCost.toFixed(2)} ETB
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleExtend}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Extend Booking'
              )}
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={extendedBooking}
        amount={extensionCost || 0}
        type="extension"
      />
    </>
  );
} 