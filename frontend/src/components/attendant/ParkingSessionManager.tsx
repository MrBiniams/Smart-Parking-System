'use client';

import React, { useState, useEffect } from 'react';
import { AttendantLocation } from '../../types/attendant';
import { attendantService } from '../../services/attendantService';

interface ParkingSessionManagerProps {
  assignedLocation: AttendantLocation | null;
  refreshTrigger: number;
}

interface NewBookingForm {
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  slotId: string;
  duration: number; // hours
  notes: string;
}

export default function ParkingSessionManager({ 
  assignedLocation, 
  refreshTrigger 
}: ParkingSessionManagerProps) {
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [endingSession, setEndingSession] = useState<string | null>(null);

  const [newBooking, setNewBooking] = useState<NewBookingForm>({
    plateNumber: '',
    customerName: '',
    customerPhone: '',
    slotId: '',
    duration: 2,
    notes: ''
  });

  // Fetch active bookings and available slots
  const fetchData = async () => {
    if (!assignedLocation) return;

    try {
      setLoading(true);
      setError(null);

      // Get current bookings for the location
      const bookingsResponse = await attendantService.getMyLocationBookings();
      const activeBookings = bookingsResponse.data.filter(
        booking => booking.bookingStatus === 'active'
      );
      setActiveBookings(activeBookings);

      // TODO: Fetch available slots from slots API
      // For now, create mock slots
      setAvailableSlots([
        { id: '1', name: 'A-001', slotStatus: 'available' },
        { id: '2', name: 'A-002', slotStatus: 'available' },
        { id: '3', name: 'A-003', slotStatus: 'available' },
        { id: '4', name: 'B-001', slotStatus: 'available' },
        { id: '5', name: 'B-002', slotStatus: 'available' },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching session data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new parking session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setCreating(true);
      setError(null);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (newBooking.duration * 60 * 60 * 1000));

      await attendantService.createAttendantBooking({
        slotId: newBooking.slotId,
        plateNumber: newBooking.plateNumber.toUpperCase(),
        time: newBooking.duration.toString(), // Backend expects 'time' not startTime/endTime
        phoneNumber: newBooking.customerPhone || '+251900000000', // Backend expects 'phoneNumber' not customerPhone
        customerName: newBooking.customerName || 'Walk-in Customer'
      });

      // Reset form and refresh data
      setNewBooking({
        plateNumber: '',
        customerName: '',
        customerPhone: '',
        slotId: '',
        duration: 2,
        notes: ''
      });
      setShowCreateForm(false);
      fetchData();

      // Show success message
      alert('Parking session created successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to create parking session');
    } finally {
      setCreating(false);
    }
  };

  // End parking session
  const handleEndSession = async (bookingId: string) => {
    if (!confirm('Are you sure you want to end this parking session?')) {
      return;
    }

    try {
      setEndingSession(bookingId);
      setError(null);

      await attendantService.endParkingSession(bookingId);
      fetchData();

      alert('Parking session ended successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to end parking session');
    } finally {
      setEndingSession(null);
    }
  };

  // Format duration
  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
    return `${diffHours}h`;
  };

  // Check if booking is ending soon (within 30 minutes)
  const isEndingSoon = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= 30 && diffMinutes > 0;
  };

  useEffect(() => {
    fetchData();
  }, [assignedLocation, refreshTrigger]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Active Parking Sessions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeBookings.length} active session{activeBookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading sessions...</p>
        </div>
      ) : activeBookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new parking session.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white border rounded-lg p-4 ${
                isEndingSoon(booking.endTime) ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              {/* Plate Number */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.plateNumber}
                </h3>
                {isEndingSoon(booking.endTime) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Ending Soon
                  </span>
                )}
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {booking.user?.firstName || 'Unknown'} {booking.user?.lastName || 'Customer'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {booking.user?.phoneNumber || 'No phone number'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Slot {booking.slot?.slotNumber || booking.slot?.name || 'Unknown'}
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Start</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">End</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Duration and Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Duration: <span className="font-medium text-gray-900">
                    {formatDuration(booking.startTime, booking.endTime)}
                  </span>
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ${booking.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleEndSession(booking.documentId)}
                disabled={endingSession === booking.documentId}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {endingSession === booking.documentId ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ending...
                  </div>
                ) : (
                  'End Session'
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create New Parking Session
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBooking.plateNumber}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, plateNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                    placeholder="ABC-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBooking.customerName}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newBooking.customerPhone}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                    placeholder="+251912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parking Slot *
                  </label>
                  <select
                    required
                    value={newBooking.slotId}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, slotId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                  >
                    <option value="">Select a slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (hours) *
                  </label>
                  <select
                    required
                    value={newBooking.duration}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      'Create Session'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
