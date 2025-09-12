import React, { useEffect, useState } from 'react';
import type { Booking } from '@/types';
import { getUserBookings } from '@/services/bookings.service';
import dayjs, { formatDateTime, getTimeRemaining } from '@/utils/date';
import ExtendBookingModal from './ExtendBookingModal';

interface ActiveBookingsProps {
  userId: number;
}

export default function ActiveBookings({ userId }: ActiveBookingsProps) {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(dayjs());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate counts
  const upcomingCount = activeBookings.filter(booking => new Date(booking.startTime) > new Date()).length;
  const activeCount = activeBookings.filter(booking => new Date(booking.startTime) <= new Date()).length;

  useEffect(() => {
    const fetchActiveBookings = async () => {
      if (!userId) return;
      
      try {
        setIsLoadingBookings(true);
        const bookings = await getUserBookings();
        setActiveBookings(bookings);
      } catch (err) {
        setBookingsError('Failed to load active bookings');
        console.error('Error loading active bookings:', err);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchActiveBookings();
  }, [userId]);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleExtendBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleExtendConfirm = async (hours: number) => {
    if (!selectedBooking) return;

    try {
      // TODO: Implement the API call to extend the booking
      console.log('Extending booking:', selectedBooking.id, 'by', hours, 'hours');
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedBooking(null);
      
      // Refresh the bookings list
      const bookings = await getUserBookings();
      setActiveBookings(bookings);
    } catch (error) {
      console.error('Error extending booking:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-1">
            Your
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {upcomingCount}
            </span>
            Upcoming
            and
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {activeCount}
            </span>
            Active
            Bookings
          </h3>
        </div>
        <svg 
          className={`h-6 w-6 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        {isLoadingBookings ? (
          <div className="animate-pulse">Loading active bookings...</div>
        ) : bookingsError ? (
          <div className="text-red-500">{bookingsError}</div>
        ) : activeBookings.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No active or upcoming bookings</div>
        ) : (
          <div className="space-y-2">
            {activeBookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-2 hover:border-blue-500 transition-colors bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {booking.slot.location?.name || booking.location.address}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">Slot {booking.slot.name}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        booking.bookingStatus === 'active' ? 'bg-green-100 text-green-800' :
                        booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.bookingStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <div>
                        <p className="text-[10px] text-gray-500">Start Time</p>
                        <p className="text-xs font-medium text-gray-900">
                          {formatDateTime(booking.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500">Time Remaining</p>
                        <p className="text-xs font-medium text-gray-900">
                          {getTimeRemaining(booking.startTime, booking.endTime, now)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      <span className="text-xs text-gray-600 truncate">Plate: {booking.plateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleExtendBooking(booking)}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Extend Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <ExtendBookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          onExtend={handleExtendConfirm}
        />
      )}
    </div>
  );
} 