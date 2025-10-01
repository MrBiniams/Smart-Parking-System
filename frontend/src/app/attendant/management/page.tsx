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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blue-100">
          Managing {assignedLocation?.name || 'your location'} • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
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
              <p className="text-2xl font-bold text-green-600">${stats.todayRevenue}</p>
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
              <p className="text-2xl font-bold text-red-600">{stats.overstayedVehicles}</p>
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
              <p className="text-2xl font-bold text-blue-600">{stats.availableSlots}</p>
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement payment processing
    console.log('Processing payment:', { paymentMethod, amount, plateNumber });
    alert(`Payment of $${amount} processed via ${paymentMethod} for vehicle ${plateNumber}`);
    setAmount('');
    setPlateNumber('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Processing</h2>
        
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
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
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Cash</span>
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
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="font-medium">POS Terminal</span>
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
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">TeleBirr</span>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Process Payment
          </button>
        </form>
      </div>
    </div>
  );
};

const ParkingSessionsTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number }> = ({ assignedLocation, refreshTrigger }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parking Sessions</h2>
          <p className="text-gray-600">Create and manage parking sessions for your location</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>New Session</span>
        </button>
      </div>

      {/* Create New Session Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Parking Session</h3>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
            <input
              type="text"
              placeholder="ABC-1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
              placeholder="+251 911 234 567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Session
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new parking session to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleValidationTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number }> = ({ assignedLocation, refreshTrigger }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;

    setValidating(true);
    try {
      const response = await attendantService.validateVehicle(plateNumber.toUpperCase());
      setResult(response);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Validation</h2>
      
      <form onSubmit={handleValidate} className="mb-6">
        <div className="flex space-x-3">
          <input
            type="text"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            placeholder="Enter license plate (ABC-1234)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={validating}
          />
          <button
            type="submit"
            disabled={validating || !plateNumber.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {validating ? 'Validating...' : 'Validate'}
          </button>
        </div>
      </form>

      {result && (
        <div className={`p-4 rounded-md ${result.error ? 'bg-red-50 border border-red-200' : result.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          {result.error ? (
            <p className="text-red-700">Error: {result.error}</p>
          ) : (
            <div>
              <p className={`font-medium ${result.valid ? 'text-green-700' : 'text-yellow-700'}`}>
                {result.message}
              </p>
              {result.booking && (
                <div className="mt-2 text-sm">
                  <p><strong>Customer:</strong> {result.booking.user.firstName} {result.booking.user.lastName}</p>
                  <p><strong>Phone:</strong> {result.booking.user.phoneNumber}</p>
                  <p><strong>Slot:</strong> {result.booking.slot.slotNumber}</p>
                  <p><strong>End Time:</strong> {new Date(result.booking.endTime).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OverstayManagementTab: React.FC<{ assignedLocation: AttendantLocation | null; refreshTrigger: number }> = ({ assignedLocation, refreshTrigger }) => {
  const [overstayedVehicles, setOverstayedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverstayed = async () => {
    setLoading(true);
    try {
      const response = await attendantService.getOverstayedVehicles();
      setOverstayedVehicles(response.data);
    } catch (error) {
      console.error('Error fetching overstayed vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignedLocation) {
      fetchOverstayed();
    }
  }, [assignedLocation, refreshTrigger]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Overstayed Vehicles</h2>
        <button
          onClick={fetchOverstayed}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner message="Loading overstayed vehicles..." />
        </div>
      ) : overstayedVehicles.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No overstayed vehicles</h3>
          <p className="mt-1 text-sm text-gray-500">All vehicles are within their parking time limits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {overstayedVehicles.map((vehicle, index) => (
            <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{vehicle.booking?.plateNumber || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">
                    Overstayed: {Math.floor((vehicle.overstayMinutes || 0) / 60)}h {(vehicle.overstayMinutes || 0) % 60}m
                  </p>
                  <p className="text-sm text-red-600">
                    Additional Cost: ${(vehicle.additionalCost || 0).toFixed(2)}
                  </p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Process Payment
                </button>
              </div>
            </div>
          ))}
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
            />
          )}
          
          {activeTab === 'validate' && (
            <VehicleValidationTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
            />
          )}
          
          {activeTab === 'overstay' && (
            <OverstayManagementTab 
              assignedLocation={assignedLocation}
              refreshTrigger={refreshTrigger}
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
