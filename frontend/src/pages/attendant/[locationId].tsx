import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import AttendantBookingList from '@/components/booking/AttendantBookingList';
import AttendantBookingForm from '@/components/booking/AttendantBookingForm';

export default function AttendantLocationPage() {
  const router = useRouter();
  const { locationId } = router.query;
  const { user, loading: authLoading, isAttendant } = useAuth();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Redirect if not an attendant
  React.useEffect(() => {
    if (!authLoading && !isAttendant) {
      router.push('/');
    }
  }, [authLoading, isAttendant, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAttendant) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Location Bookings</h1>
        <button
          onClick={() => setShowBookingForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Booking
        </button>
      </div>

      {showBookingForm ? (
        <div className="mb-8">
          <AttendantBookingForm
            locationId={locationId as string}
            slotId={selectedSlotId || ''}
            onSuccess={() => {
              setShowBookingForm(false);
              setSelectedSlotId(null);
            }}
            onCancel={() => {
              setShowBookingForm(false);
              setSelectedSlotId(null);
            }}
          />
        </div>
      ) : (
        <AttendantBookingList locationId={locationId as string} />
      )}
    </div>
  );
} 