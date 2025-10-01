'use client';

import React, { useState } from 'react';
import { AttendantBooking, BookingStatus } from '@/types/attendant';

interface AttendantBookingCardProps {
  booking: AttendantBooking;
  onUpdateStatus: (status: BookingStatus) => Promise<void>;
  isUpdating?: boolean;
}

export default function AttendantBookingCard({
  booking,
  onUpdateStatus,
  isUpdating = false
}: AttendantBookingCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const startDateTime = formatDateTime(booking.startTime);
  const endDateTime = formatDateTime(booking.endTime);

  // Get status color and actions
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          actions: ['confirmed', 'cancelled']
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800',
          actions: ['active', 'cancelled']
        };
      case 'active':
        return {
          color: 'bg-green-100 text-green-800',
          actions: ['completed']
        };
      case 'completed':
        return {
          color: 'bg-gray-100 text-gray-800',
          actions: []
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          actions: []
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          actions: []
        };
    }
  };

  const statusConfig = getStatusConfig(booking.bookingStatus);

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate duration
  const getDuration = () => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
    return `${diffHours}h`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Vehicle Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            
            {/* Plate Number */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.plateNumber}
              </h3>
              <p className="text-sm text-gray-500">
                Slot {booking.slot.slotNumber}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {booking.bookingStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Customer Info */}
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm text-gray-600">
            {booking.user.firstName} {booking.user.lastName}
          </span>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm text-gray-600">
            {booking.user.phoneNumber}
          </span>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Start</p>
            <p className="font-medium text-gray-900">
              {startDateTime.time}
            </p>
            <p className="text-xs text-gray-500">
              {startDateTime.date}
            </p>
          </div>
          <div>
            <p className="text-gray-500">End</p>
            <p className="font-medium text-gray-900">
              {endDateTime.time}
            </p>
            <p className="text-xs text-gray-500">
              {endDateTime.date}
            </p>
          </div>
        </div>

        {/* Duration and Price */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Duration: <span className="font-medium text-gray-900">{getDuration()}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${booking.totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {statusConfig.actions.length > 0 && (
        <div className="px-4 pb-4">
          {!showActions ? (
            <button
              onClick={() => setShowActions(true)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Update Status
            </button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {statusConfig.actions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      onUpdateStatus(action as BookingStatus);
                      setShowActions(false);
                    }}
                    disabled={isUpdating}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      action === 'cancelled'
                        ? 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100'
                        : 'text-green-600 bg-green-50 border border-green-200 hover:bg-green-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    ) : (
                      action.charAt(0).toUpperCase() + action.slice(1)
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowActions(false)}
                className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
