import { useState } from 'react';
import useStore from '@/store/useStore';
import { BookingData } from '@/types';

export const useBooking = () => {
  const { 
    selectedLocation, 
    selectedSlot, 
    bookingData,
    setSelectedLocation, 
    setSelectedSlot, 
    setBookingData,
    resetBooking 
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (startTime: string, endTime: string) => {
    if (!selectedLocation || !selectedSlot) {
      setError('Please select a location and slot first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBookingData: BookingData = {
        slotId: selectedSlot.documentId,
        locationId: selectedLocation.documentId,
        startTime,
        endTime,
        userId: 'user123', // This should come from your auth system
      };

      setBookingData(newBookingData);
      
      // Here you would typically make an API call to create the booking
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newBookingData),
      // });
      
      // if (!response.ok) throw new Error('Failed to create booking');
      
      // Reset the booking state after successful creation
      resetBooking();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedLocation,
    selectedSlot,
    bookingData,
    isLoading,
    error,
    setSelectedLocation,
    setSelectedSlot,
    createBooking,
    resetBooking,
  };
}; 