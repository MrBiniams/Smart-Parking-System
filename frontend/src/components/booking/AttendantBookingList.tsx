import React, { useEffect, useState } from 'react';
import { Booking } from '@/services/api';
import { fetchAttendantBookings } from '@/services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AttendantBookingListProps {
  locationId: string;
  filters?: {
    phoneNumber?: string;
    plateNumber?: string;
  };
}

export default function AttendantBookingList({ locationId, filters }: AttendantBookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const data = await fetchAttendantBookings(locationId);
        setBookings(data);
        setError(null);
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      loadBookings();
    }
  }, [locationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Location Bookings</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {bookings.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No bookings found for this location
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {booking.plateNumber}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Slot: {booking.slot?.name}</p>
                    <p>User: {booking.user?.phoneNumber || booking.user?.email}</p>
                    <p>Start: {new Date(booking.startTime).toLocaleString()}</p>
                    <p>End: {new Date(booking.endTime).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                  ${booking.totalPrice?.toFixed(2) || '0.00'}
                  </div>
                  <div className={`mt-1 text-xs ${getStatusColor(booking.paymentStatus || 'unknown')} px-2 py-1 rounded-full inline-block`}>
                      {booking.paymentStatus || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 