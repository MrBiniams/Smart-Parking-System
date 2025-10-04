'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AttendantLocation } from '../../../types/attendant';
import { attendantService } from '../../../services/attendantService';
import { useUserStore } from '../../../store/userStore';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ErrorMessage from '../../../components/ui/ErrorMessage';

// Tab Components
const DashboardTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number; onRefresh: () => void; onTabChange: (tab: 'dashboard' | 'sessions' | 'validate' | 'overstay' | 'payments') => void }> = ({ assignedLocation, refreshTrigger, onRefresh, onTabChange }) => {
  const [stats, setStats] = useState({
    activeBookings: 0,
    todayRevenue: 0,
    overstayedVehicles: 0,
    availableSlots: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard stats when component mounts or refreshTrigger changes
  useEffect(() => {
    if (assignedLocation?.documentId) {
      loadDashboardStats();
    }
  }, [assignedLocation, refreshTrigger]);

  const loadDashboardStats = async () => {
    if (!assignedLocation?.documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel for better performance
      const [bookingsResponse, overstayedResponse, slotsResponse] = await Promise.all([
        attendantService.getMyLocationBookings(),
        attendantService.getOverstayedVehicles(),
        attendantService.getAvailableSlots(assignedLocation.documentId)
      ]);

      // Calculate active bookings
      const activeBookings = bookingsResponse.data.filter((booking: any) => 
        booking.bookingStatus === 'active'
      ).length;

      // Calculate today's revenue (completed bookings today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayRevenue = bookingsResponse.data
        .filter((booking: any) => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate >= today && 
                 bookingDate < tomorrow && 
                 booking.bookingStatus === 'completed';
        })
        .reduce((total: number, booking: any) => {
          // Calculate revenue based on booking duration and rate
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          const hours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
          const rate = booking.slot?.hourlyRate || 5; // Default rate if not available
          return total + (hours * rate);
        }, 0);

      // Get overstayed vehicles count
      const overstayedVehicles = overstayedResponse.data.length;

      // Get available slots count
      const availableSlots = slotsResponse.data.length;

      setStats({
        activeBookings,
        todayRevenue,
        overstayedVehicles,
        availableSlots
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="text-blue-100">
              Managing {assignedLocation?.name || 'your location'} • {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={loadDashboardStats}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">${stats.todayRevenue.toFixed(2)}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overstayed</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className={`text-2xl font-bold ${stats.overstayedVehicles > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.overstayedVehicles}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Slots</p>
              {loading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className={`text-2xl font-bold ${stats.availableSlots === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {stats.availableSlots}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onTabChange('sessions')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-blue-900">New Booking</p>
                <p className="text-sm text-gray-500">Create parking session</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('validate')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-green-900">Validate Vehicle</p>
                <p className="text-sm text-gray-500">Check license plate</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('payments')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-yellow-900">Process Payment</p>
                <p className="text-sm text-gray-500">Handle overstay fees</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentProcessingTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number }> = ({ assignedLocation, refreshTrigger }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos' | 'telebirr'>('cash');
  const [amount, setAmount] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Load recent payments when component mounts
  useEffect(() => {
    loadRecentPayments();
  }, [refreshTrigger]);

  const loadRecentPayments = async () => {
    setLoading(true);
    try {
      // For now, we'll simulate recent payments. In real implementation, 
      // you'd have an API endpoint for payment history
      const mockPayments = [
        {
          id: '1',
          plateNumber: 'ABC-123',
          amount: 15.50,
          method: 'cash',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'overstay'
        },
        {
          id: '2',
          plateNumber: 'XYZ-789',
          amount: 8.00,
          method: 'telebirr',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          type: 'regular'
        }
      ];
      setRecentPayments(mockPayments);
    } catch (err: any) {
      console.error('Error loading recent payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateVehicleForPayment = async () => {
    if (!plateNumber.trim()) return;
    
    try {
      const result = await attendantService.validateVehicle(plateNumber.toUpperCase());
      setValidationResult(result);
      
      if (result.isOverstayed && result.overstayDetails) {
        setAmount(result.overstayDetails.totalDue?.toString() || '0');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setProcessing(true);

    try {
      if (!plateNumber.trim() || !amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter valid license plate and amount');
      }

      // First validate the vehicle if not already validated
      if (!validationResult) {
        await validateVehicleForPayment();
      }

      // Process the payment
      if (validationResult?.booking) {
        // This is an overstay payment
        await attendantService.processOverstayPayment(
          validationResult.booking.documentId,
          paymentMethod,
          notes || `${paymentMethod.toUpperCase()} payment for ${plateNumber}`
        );
      } else {
        // This would be a manual payment entry - you'd need a separate API for this
        console.log('Manual payment processing:', { plateNumber, amount, paymentMethod, notes });
      }

      setSuccess(`Payment of $${amount} processed successfully via ${paymentMethod.toUpperCase()} for ${plateNumber}`);
      
      // Reset form
      setAmount('');
      setPlateNumber('');
      setNotes('');
      setValidationResult(null);
      
      // Reload recent payments
      loadRecentPayments();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
          <p className="text-gray-600">Process payments for parking fees and overstay charges</p>
        </div>
        <button
          onClick={loadRecentPayments}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Payment Processing Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Process New Payment</h3>
        
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => {
                    setPlateNumber(e.target.value);
                    setValidationResult(null);
                  }}
                  placeholder="ABC-1234"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg text-gray-900 bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={validateVehicleForPayment}
                  disabled={!plateNumber.trim()}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Validate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($) *</label>
              <input
                type="number"
                step="1"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Vehicle Validation Result */}
          {validationResult && (
            <div className={`p-4 rounded-lg border ${
              validationResult.valid 
                ? validationResult.isOverstayed 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <svg className={`w-5 h-5 ${
                  validationResult.valid 
                    ? validationResult.isOverstayed 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                    : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={validationResult.valid 
                      ? validationResult.isOverstayed 
                        ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M6 18L18 6M6 6l12 12"
                    } 
                  />
                </svg>
                <span className={`font-medium ${
                  validationResult.valid 
                    ? validationResult.isOverstayed 
                      ? 'text-yellow-800' 
                      : 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {validationResult.message}
                </span>
              </div>
              {validationResult.isOverstayed && validationResult.overstayDetails && (
                <p className="text-sm text-yellow-700">
                  Suggested amount: ${validationResult.overstayDetails.totalDue?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Cash Payment</p>
                    <p className="text-sm text-gray-500">Physical cash transaction</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pos')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'pos'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">POS Terminal</p>
                    <p className="text-sm text-gray-500">Card payment</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('telebirr')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'telebirr'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">TeleBirr</p>
                    <p className="text-sm text-gray-500">Mobile payment</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this payment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processing && (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{processing ? 'Processing Payment...' : 'Process Payment'}</span>
          </button>
        </form>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Loading payments...</span>
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Recent Payments</h3>
              <p className="mt-1 text-sm text-gray-500">
                Payment transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.method === 'cash' ? 'bg-green-100' :
                        payment.method === 'pos' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          payment.method === 'cash' ? 'text-green-600' :
                          payment.method === 'pos' ? 'text-blue-600' : 'text-purple-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={payment.method === 'cash' ? 
                              "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" :
                              payment.method === 'pos' ?
                              "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" :
                              "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            } 
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{payment.plateNumber}</h4>
                        <p className="text-sm text-gray-600">
                          {payment.method.toUpperCase()} • {new Date(payment.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 capitalize">{payment.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ParkingSessionsTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number; onRefresh?: () => void }> = ({ assignedLocation, refreshTrigger, onRefresh }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    plateNumber: '',
    duration: '2',
    customerPhone: '',
    customerName: '',
    slotId: ''
  });

  // Load available slots when component mounts or location changes
  useEffect(() => {
    if (assignedLocation?.documentId) {
      loadAvailableSlots();
    }
  }, [assignedLocation, refreshTrigger]);

  // Load active sessions when component mounts
  useEffect(() => {
    loadActiveSessions();
  }, [refreshTrigger]);

  const loadAvailableSlots = async () => {
    if (!assignedLocation?.documentId) return;
    
    setLoadingSlots(true);
    try {
      const response = await attendantService.getAvailableSlots(assignedLocation.documentId);
      
      // Debug: Log slot data structure
      console.log('=== AVAILABLE SLOTS DEBUG ===');
      console.log('Slots response:', response);
      console.log('First slot structure:', response.data[0]);
      console.log('==============================');
      
      setAvailableSlots(response.data);
      
      // Auto-select first available slot if none selected
      if (response.data.length > 0 && !formData.slotId) {
        setFormData(prev => ({ ...prev, slotId: response.data[0]?.documentId || '' }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadActiveSessions = async () => {
    setLoading(true);
    try {
      const response = await attendantService.getMyLocationBookings();
      
      console.log('=== ACTIVE SESSIONS DEBUG ===');
      console.log('All bookings:', response.data);
      console.log('Filtering for active bookings...');
      
      // Filter only active sessions
      const activeSessions = response.data.filter((booking: any) => {
        console.log(`Booking ${booking.plateNumber}: status = "${booking.bookingStatus}"`);
        return booking.bookingStatus === 'active';
      });
      
      console.log('Active bookings found:', activeSessions.length);
      console.log('Active bookings:', activeSessions);
      console.log('==============================');
      
      setSessions(activeSessions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // End parking session
  const handleEndSession = async (bookingId: string) => {
    if (!confirm('Are you sure you want to end this parking session?')) return;
    
    try {
      await attendantService.endParkingSession(bookingId);
      alert('Parking session ended successfully!');
      loadActiveSessions(); // Refresh sessions
      onRefresh?.(); // Refresh parent data
    } catch (error: any) {
      alert('Error ending session: ' + error.message);
    }
  };

  // Process overstay payment
  const handleProcessPayment = async (bookingId: string) => {
    const amount = prompt('Enter payment amount:');
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      await attendantService.processOverstayPayment(bookingId, 'cash');
      alert('Payment processed successfully!');
      loadActiveSessions(); // Refresh sessions
      onRefresh?.(); // Refresh parent data
    } catch (error: any) {
      alert('Error processing payment: ' + error.message);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.plateNumber.trim() || !formData.slotId) {
      setError('Please fill in license plate and select a slot');
      return;
    }

    setCreating(true);
    try {
      const bookingData = {
        slotId: formData.slotId,
        plateNumber: formData.plateNumber.toUpperCase(),
        time: formData.duration, // Backend expects 'time' not duration
        phoneNumber: formData.customerPhone || '+251900000000', // Backend requires phoneNumber
        customerName: formData.customerName || 'Walk-in Customer',
      };

      console.log('=== CREATING ATTENDANT BOOKING ===');
      console.log('Booking data:', bookingData);
      console.log('================================');

      await attendantService.createAttendantBooking(bookingData);
      
      setSuccess(`Parking session created successfully for ${formData.plateNumber}`);
      
      // Reset form
      setFormData({
        plateNumber: '',
        duration: '2',
        customerPhone: '',
        customerName: '',
        slotId: availableSlots.length > 0 ? availableSlots[0]?.documentId || '' : ''
      });
      
      // Reload data
      loadActiveSessions();
      loadAvailableSlots();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parking Sessions</h2>
          <p className="text-gray-600">Create and manage parking sessions for your location</p>
        </div>
        <button 
          onClick={loadActiveSessions}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Create New Session Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Parking Session</h3>
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleInputChange}
                placeholder="ABC-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parking Slot *</label>
              <select
                name="slotId"
                value={formData.slotId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
                required
                disabled={loadingSlots}
              >
                {loadingSlots ? (
                  <option>Loading slots...</option>
                ) : availableSlots.length === 0 ? (
                  <option>No available slots</option>
                ) : (
                  availableSlots.map((slot: any) => {
                    // Try different possible property names for slot identification
                    const slotIdentifier = slot.slotNumber || slot.name || slot.number || slot.id || 'Unknown';
                    const slotType = slot.slotType || slot.type || 'Standard';
                    
                    return (
                      <option key={slot.documentId} value={slot.documentId}>
                        Slot {slotIdentifier} ({slotType})
                      </option>
                    );
                  })
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="4">4 Hours</option>
                <option value="8">8 Hours</option>
                <option value="24">24 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="+251 911 234 567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-600 font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={creating || availableSlots.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {creating && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{creating ? 'Creating...' : 'Create Session'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions ({sessions.length})</h3>
          {sessions.length > 0 && (
            <span className="text-sm text-gray-500">
              {sessions.length} vehicle{sessions.length !== 1 ? 's' : ''} currently parked
            </span>
          )}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Sessions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create a new parking session to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session: any) => {
                const startTime = new Date(session.startTime);
                const endTime = new Date(session.endTime);
                const now = new Date();
                const timeRemaining = endTime.getTime() - now.getTime();
                const isOverstayed = timeRemaining < 0;
                const hoursRemaining = Math.abs(Math.floor(timeRemaining / (1000 * 60 * 60)));
                const minutesRemaining = Math.abs(Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));

                return (
                  <div key={session.documentId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${isOverstayed ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{session.plateNumber}</h4>
                          <p className="text-sm text-gray-600">
                            Slot {session.slot?.slotNumber} • {session.slot?.slotType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isOverstayed ? 'text-red-600' : 'text-green-600'}`}>
                          {isOverstayed ? 'OVERSTAYED' : 'ACTIVE'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isOverstayed 
                            ? `${hoursRemaining}h ${minutesRemaining}m over`
                            : `${hoursRemaining}h ${minutesRemaining}m left`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Started:</span> {startTime.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Ends:</span> {endTime.toLocaleString()}
                      </div>
                      {session.customerName && (
                        <div>
                          <span className="font-medium">Customer:</span> {session.customerName}
                        </div>
                      )}
                      {session.customerPhone && (
                        <div>
                          <span className="font-medium">Phone:</span> {session.customerPhone}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button 
                        onClick={() => handleEndSession(session.documentId)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        End Session
                      </button>
                      {isOverstayed && (
                        <button 
                          onClick={() => handleProcessPayment(session.documentId)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                        >
                          Process Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VehicleValidationTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number; onRefresh?: () => void }> = ({ assignedLocation, refreshTrigger, onRefresh }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;

    setValidating(true);
    setError(null);
    setResult(null);

    try {
      const response = await attendantService.validateVehicle(plateNumber.trim());
      
      // Debug logs removed - validation working correctly
      
      setResult(response);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setValidating(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
    setPlateNumber('');
  };

  // End parking session
  const handleEndSession = async (bookingId: string) => {
    if (!confirm('Are you sure you want to end this parking session?')) return;
    
    try {
      await attendantService.endParkingSession(bookingId);
      alert('Parking session ended successfully!');
      // Refresh the data
      onRefresh?.();
      clearResults();
    } catch (error: any) {
      alert('Error ending session: ' + error.message);
    }
  };

  // Process overstay payment
  const handleProcessPayment = async (bookingId: string) => {
    const amount = prompt('Enter payment amount:');
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      await attendantService.processOverstayPayment(bookingId, 'cash');
      alert('Payment processed successfully!');
      // Refresh the data
      onRefresh?.();
      clearResults();
    } catch (error: any) {
      alert('Error processing payment: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Validation</h2>
          <p className="text-gray-600">Validate parked vehicles and check their booking status</p>
        </div>
        {(result || error) && (
          <button
            onClick={clearResults}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Results
          </button>
        )}
      </div>

      {/* Validation Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter License Plate</h3>
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Plate Number</label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="ABC-1234"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-gray-900 bg-white"
                disabled={validating}
                maxLength={10}
              />
              <button
                type="submit"
                disabled={validating || !plateNumber.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              >
                {validating && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{validating ? 'Validating...' : 'Validate Vehicle'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Validation Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {result && (
        <div className="space-y-4">
          {/* Status Card */}
          <div className={`rounded-xl border-2 p-6 ${
            result.valid 
              ? result.isOverstayed 
                ? 'bg-yellow-50 border-yellow-200' 
                : 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                result.valid 
                  ? result.isOverstayed 
                    ? 'bg-yellow-100' 
                    : 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                {result.valid ? (
                  result.isOverstayed ? (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  result.valid 
                    ? result.isOverstayed 
                      ? 'text-yellow-800' 
                      : 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {result.valid 
                    ? 'VALID PARKING'
                    : result.isOverstayed 
                      ? 'OVERSTAYED VEHICLE'
                      : 'INVALID/NO BOOKING'
                  }
                </h3>
                <p className={`${
                  result.valid 
                    ? result.isOverstayed 
                      ? 'text-yellow-700' 
                      : 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {result.booking && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">License Plate</span>
                    <p className="text-lg font-mono font-bold text-gray-900">{result.booking.plateNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Parking Slot</span>
                    <p className="text-lg font-semibold text-gray-900">
                      Slot {result.booking.slot?.slotNumber} ({result.booking.slot?.slotType})
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className={`text-lg font-semibold ${
                      result.booking.bookingStatus === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {result.booking.bookingStatus?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Start Time</span>
                    <p className="text-lg text-gray-900">
                      {new Date(result.booking.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">End Time</span>
                    <p className="text-lg text-gray-900">
                      {new Date(result.booking.endTime).toLocaleString()}
                    </p>
                  </div>
                  {result.booking.user && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Customer</span>
                      <p className="text-lg text-gray-900">
                        {result.booking.user.firstName} {result.booking.user.lastName}
                      </p>
                      {result.booking.user.phoneNumber && (
                        <p className="text-sm text-gray-600">{result.booking.user.phoneNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Overstay Details */}
              {result.isOverstayed && result.overstayDetails && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Overstay Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-yellow-700">Overstay Duration:</span>
                      <p className="text-yellow-800">{result.overstayDetails.overstayHours} hours</p>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-700">Additional Cost:</span>
                      <p className="text-yellow-800">${result.overstayDetails.additionalCost?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-700">Total Due:</span>
                      <p className="text-yellow-800 font-bold">${result.overstayDetails.totalDue?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                {result.isOverstayed && (
                  <button 
                    onClick={() => handleProcessPayment(result.booking.documentId)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Process Overstay Payment
                  </button>
                )}
                <button 
                  onClick={() => handleEndSession(result.booking.documentId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Parking Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OverstayManagementTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number; onRefresh?: () => void }> = ({ assignedLocation, refreshTrigger, onRefresh }) => {
  const [overstayedVehicles, setOverstayedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ show: boolean; vehicle: any }>({ show: false, vehicle: null });

  const fetchOverstayed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendantService.getOverstayedVehicles();
      setOverstayedVehicles(response.data);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching overstayed vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // End parking session
  const handleEndSession = async (bookingId: string) => {
    if (!confirm('Are you sure you want to end this parking session?')) return;
    
    try {
      await attendantService.endParkingSession(bookingId);
      alert('Parking session ended successfully!');
      fetchOverstayed(); // Refresh overstayed vehicles
      onRefresh?.(); // Refresh parent data
    } catch (error: any) {
      alert('Error ending session: ' + error.message);
    }
  };

  const handleProcessPayment = async (vehicle: any, paymentMethod: 'cash' | 'pos' | 'telebirr') => {
    setProcessingPayment(vehicle.booking.documentId);
    try {
      await attendantService.processOverstayPayment(
        vehicle.booking.documentId,
        paymentMethod,
        `Overstay payment for ${vehicle.booking.plateNumber}`
      );
      
      // Refresh the overstayed vehicles list
      await fetchOverstayed();
      setPaymentModal({ show: false, vehicle: null });
      
      // Show success message (you could add a toast notification here)
      alert(`Payment processed successfully for ${vehicle.booking.plateNumber}`);
      
    } catch (error: any) {
      alert(`Payment failed: ${error.message}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  useEffect(() => {
    if (assignedLocation) {
      fetchOverstayed();
    }
  }, [assignedLocation, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overstay Management</h2>
          <p className="text-gray-600">Handle vehicles that have exceeded their parking time</p>
        </div>
        <button
          onClick={fetchOverstayed}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-gray-600">Loading overstayed vehicles...</span>
          </div>
        </div>
      ) : overstayedVehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">All Clear!</h3>
            <p className="mt-2 text-gray-600">No vehicles have overstayed their parking time.</p>
            <p className="text-sm text-gray-500 mt-1">Great job managing your location!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-800 font-medium">
                {overstayedVehicles.length} vehicle{overstayedVehicles.length !== 1 ? 's' : ''} currently overstayed
              </p>
            </div>
          </div>

          {overstayedVehicles.map((vehicle, index) => {
            const overstayHours = Math.floor((vehicle.overstayMinutes || 0) / 60);
            const overstayMins = (vehicle.overstayMinutes || 0) % 60;
            const endTime = new Date(vehicle.booking?.endTime);
            const now = new Date();
            const totalOverstayTime = now.getTime() - endTime.getTime();
            const actualOverstayHours = Math.floor(totalOverstayTime / (1000 * 60 * 60));
            const actualOverstayMins = Math.floor((totalOverstayTime % (1000 * 60 * 60)) / (1000 * 60));

            return (
              <div key={vehicle.booking?.documentId || index} className="bg-white rounded-xl border-l-4 border-l-red-500 border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <h3 className="text-xl font-bold text-gray-900">{vehicle.booking?.plateNumber || 'Unknown'}</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        OVERSTAYED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Parking Slot</span>
                        <p className="text-lg font-semibold text-gray-900">
                          Slot {vehicle.booking?.slot?.slotNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Ended At</span>
                        <p className="text-lg text-gray-900">
                          {endTime.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Overstay Duration</span>
                        <p className="text-lg font-bold text-red-600">
                          {actualOverstayHours}h {actualOverstayMins}m
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Additional Cost</span>
                        <p className="text-lg font-bold text-red-600">
                          ${(vehicle.additionalCost || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {vehicle.booking?.user && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <span className="text-sm font-medium text-gray-500">Customer Information</span>
                        <p className="text-gray-900">
                          {vehicle.booking.user.firstName} {vehicle.booking.user.lastName}
                        </p>
                        {vehicle.booking.user.phoneNumber && (
                          <p className="text-sm text-gray-600">{vehicle.booking.user.phoneNumber}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => setPaymentModal({ show: true, vehicle })}
                      disabled={processingPayment === vehicle.booking?.documentId}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment === vehicle.booking?.documentId ? 'Processing...' : 'Process Payment'}
                    </button>
                    <button 
                      onClick={() => handleEndSession(vehicle.booking?.documentId)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      End Session
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {paymentModal.show && paymentModal.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Process Payment - {paymentModal.vehicle.booking?.plateNumber}
            </h3>
            <p className="text-gray-600 mb-6">
              Amount due: <span className="font-bold text-red-600">${(paymentModal.vehicle.additionalCost || 0).toFixed(2)}</span>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleProcessPayment(paymentModal.vehicle, 'cash')}
                disabled={processingPayment !== null}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                Cash Payment
              </button>
              <button
                onClick={() => handleProcessPayment(paymentModal.vehicle, 'pos')}
                disabled={processingPayment !== null}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                POS Terminal
              </button>
              <button
                onClick={() => handleProcessPayment(paymentModal.vehicle, 'telebirr')}
                disabled={processingPayment !== null}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
              >
                TeleBirr
              </button>
            </div>
            
            <button
              onClick={() => setPaymentModal({ show: false, vehicle: null })}
              disabled={processingPayment !== null}
              className="w-full mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AttendantManagementPage() {
  const router = useRouter();
  const { user, token, logout } = useUserStore();
  const [assignedLocation, setAssignedLocation] = useState<AttendantLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sessions' | 'validate' | 'overstay' | 'payments'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!user || !token) {
      router.push('/');
      return;
    }

    if (user.role?.name !== 'Attendant') {
      router.push('/');
      return;
    }

    setTimeout(() => {
      fetchLocationData();
    }, 100);
  }, [user, token, router]);

  // Fetch initial data
  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendantService.getMyLocationBookings();
      setAssignedLocation(response.meta.assignedLocation);
    } catch (err: any) {
      setError(err.message || 'Failed to load location data');
      console.error('Error fetching location data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchLocationData();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading management dashboard..." />
      </div>
    );
  }

  if (error && !assignedLocation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ErrorMessage 
          error={error} 
          onRetry={fetchLocationData}
          title="Failed to Load Dashboard"
        />
      </div>
    );
  }

  const sidebarItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: 'sessions' as const,
      label: 'Parking Sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'validate' as const,
      label: 'Vehicle Validation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'overstay' as const,
      label: 'Overstay Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'payments' as const,
      label: 'Payment Processing',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Siso-Link</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-blue-600 truncate font-medium">Parking Attendant</p>
              </div>
            </div>
            {assignedLocation && (
              <div className="mt-4 p-3 bg-white rounded-lg shadow-sm border border-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-900">
                    {assignedLocation.name}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1 font-medium">Currently Managing</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6 space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                }`}
              >
                <span className={`transition-colors ${activeTab === item.id ? 'text-white' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className="text-left">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Attendant Dashboard</h1>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-8 bg-gray-50 overflow-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefresh}
              onTabChange={setActiveTab}
            />
          )}
          
          {activeTab === 'sessions' && (
            <ParkingSessionsTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefresh}
            />
          )}
          
          {activeTab === 'validate' && (
            <VehicleValidationTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefresh}
            />
          )}
          
          {activeTab === 'overstay' && (
            <OverstayManagementTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentProcessingTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
            />
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
