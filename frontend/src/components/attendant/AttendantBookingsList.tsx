'use client';

import React, { useState } from 'react';
import { AttendantBooking, BookingStatus } from '@/types/attendant';
import AttendantBookingCard from './AttendantBookingCard';
import AttendantEmptyState from './AttendantEmptyState';

interface AttendantBookingsListProps {
  bookings: AttendantBooking[];
  loading: boolean;
  error: string | null;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onRefresh: () => void;
}

export default function AttendantBookingsList({
  bookings,
  loading,
  error,
  onUpdateStatus,
  onRefresh
}: AttendantBookingsListProps) {
  const [updatingBookings, setUpdatingBookings] = useState<Set<string>>(new Set());

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    setUpdatingBookings(prev => new Set(prev).add(bookingId));
    
    try {
      await onUpdateStatus(bookingId, status);
    } finally {
      setUpdatingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Group bookings by status for better organization
  const groupedBookings = bookings.reduce((groups, booking) => {
    const status = booking.bookingStatus;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(booking);
    return groups;
  }, {} as Record<BookingStatus, AttendantBooking[]>);

  // Define status order and colors
  const statusConfig = {
    active: { 
      label: 'Active Bookings', 
      color: 'bg-green-50 border-green-200',
      priority: 1 
    },
    confirmed: { 
      label: 'Confirmed Bookings', 
      color: 'bg-blue-50 border-blue-200',
      priority: 2 
    },
    pending: { 
      label: 'Pending Bookings', 
      color: 'bg-yellow-50 border-yellow-200',
      priority: 3 
    },
    completed: { 
      label: 'Completed Bookings', 
      color: 'bg-gray-50 border-gray-200',
      priority: 4 
    },
    cancelled: { 
      label: 'Cancelled Bookings', 
      color: 'bg-red-50 border-red-200',
      priority: 5 
    }
  };

  if (bookings.length === 0 && !loading) {
    return (
      <AttendantEmptyState
        title="No Bookings Found"
        description="There are no bookings for your assigned location at this time."
        actionText="Refresh"
        onAction={onRefresh}
        icon={
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Render bookings grouped by status */}
      {Object.entries(statusConfig)
        .sort(([, a], [, b]) => a.priority - b.priority)
        .map(([status, config]) => {
          const statusBookings = groupedBookings[status as BookingStatus] || [];
          
          if (statusBookings.length === 0) return null;

          return (
            <div key={status} className={`rounded-lg border-2 ${config.color} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {config.label}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {statusBookings.length} booking{statusBookings.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statusBookings.map((booking) => (
                  <AttendantBookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={(newStatus) => handleUpdateStatus(booking.id, newStatus)}
                    isUpdating={updatingBookings.has(booking.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-20 bg-gray-300 rounded"></div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
