'use client';

import React, { useState, useEffect } from 'react';
import { AttendantBooking, AttendantLocation, BookingStatus } from '../../../types/attendant';
import { attendantService } from '../../../services/attendantService';
import AttendantBookingsList from '../../../components/attendant/AttendantBookingsList';
import AttendantHeader from '../../../components/attendant/AttendantHeader';
import AttendantStats from '../../../components/attendant/AttendantStats';
import AttendantFilters from '../../../components/attendant/AttendantFilters';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ErrorMessage from '../../../components/ui/ErrorMessage';

export default function AttendantBookingsPage() {
  const [bookings, setBookings] = useState<AttendantBooking[]>([]);
  const [assignedLocation, setAssignedLocation] = useState<AttendantLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<BookingStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  // Fetch bookings for attendant's assigned location
  const fetchBookings = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await attendantService.getMyLocationBookings();
      
      setBookings(response.data);
      setAssignedLocation(response.meta.assignedLocation);
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
      console.error('Error fetching attendant bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await attendantService.updateBookingStatus(bookingId, status);
      
      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, bookingStatus: status }
            : booking
        )
      );

      // Show success message (you can implement toast notifications)
      console.log(`Booking ${bookingId} status updated to ${status}`);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      // Show error message (you can implement toast notifications)
      alert(`Failed to update booking status: ${err.message}`);
    }
  };

  // Filter bookings based on current filters
  const filteredBookings = bookings.filter(booking => {
    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes(booking.bookingStatus)) {
      return false;
    }

    // Search term filter (plate number, customer name, phone)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesPlate = booking.plateNumber.toLowerCase().includes(searchLower);
      const matchesName = `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase().includes(searchLower);
      const matchesPhone = booking.user.phoneNumber.includes(searchTerm);
      
      if (!matchesPlate && !matchesName && !matchesPhone) {
        return false;
      }
    }

    // Date range filter
    if (dateRange) {
      const bookingDate = new Date(booking.startTime).toDateString();
      const startDate = new Date(dateRange.start).toDateString();
      const endDate = new Date(dateRange.end).toDateString();
      
      if (bookingDate < startDate || bookingDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading your location's bookings..." />
      </div>
    );
  }

  if (error && !bookings.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          error={error} 
          onRetry={() => fetchBookings()}
          title="Failed to Load Bookings"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AttendantHeader 
        assignedLocation={assignedLocation}
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={() => fetchBookings(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <AttendantStats bookings={bookings} />

        {/* Filters */}
        <AttendantFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        {/* Error Message (if error but we have cached data) */}
        {error && bookings.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Connection Issue
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Unable to refresh data: {error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <AttendantBookingsList
          bookings={filteredBookings}
          loading={loading}
          error={error}
          onUpdateStatus={handleUpdateBookingStatus}
          onRefresh={() => fetchBookings(true)}
        />
      </div>
    </div>
  );
}
