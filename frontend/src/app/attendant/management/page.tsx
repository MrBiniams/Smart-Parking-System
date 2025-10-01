'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AttendantLocation } from '../../../types/attendant';
import { attendantService } from '../../../services/attendantService';
import { useUserStore } from '../../../store/userStore';
import AttendantHeader from '../../../components/attendant/AttendantHeader';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ErrorMessage from '../../../components/ui/ErrorMessage';

// Inline tab components to avoid import issues
function ParkingSessionsTab({ assignedLocation, refreshTrigger }: { assignedLocation: AttendantLocation | null; refreshTrigger: number }) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Parking Sessions Management</h3>
        <p className="mt-1 text-sm text-gray-500">
          Create and manage parking sessions for walk-in customers.
        </p>
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-700">
              <strong>Features available after server restart:</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
              <li>Create new parking sessions</li>
              <li>Monitor active sessions</li>
              <li>End parking sessions</li>
              <li>Customer information management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleValidationTab({ assignedLocation, refreshTrigger }: { assignedLocation: AttendantLocation | null; refreshTrigger: number }) {
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
}

function OverstayManagementTab({ assignedLocation, refreshTrigger }: { assignedLocation: AttendantLocation | null; refreshTrigger: number }) {
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
}

export default function AttendantManagementPage() {
  const router = useRouter();
  const { user, token } = useUserStore();
  const [assignedLocation, setAssignedLocation] = useState<AttendantLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'validate' | 'overstay'>('sessions');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check authentication
  useEffect(() => {
    console.log('=== ATTENDANT MANAGEMENT AUTH CHECK ===');
    console.log('User:', user);
    console.log('Token:', token);
    console.log('User role:', user?.role?.name);
    console.log('Is attendant?', user?.role?.name === 'Attendant');
    console.log('======================================');

    if (!user || !token) {
      console.log('No user or token - redirecting to homepage');
      router.push('/');
      return;
    }

    if (user.role?.name !== 'Attendant') {
      console.log('User is not an attendant - redirecting to homepage');
      router.push('/');
      return;
    }

    // Only fetch data if user is authenticated attendant
    // Add small delay to ensure token is properly stored
    setTimeout(() => {
      fetchLocationData();
    }, 100);
  }, [user, token, router]);

  // Fetch initial data
  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get location info from bookings endpoint (contains location data)
      const response = await attendantService.getMyLocationBookings();
      setAssignedLocation(response.meta.assignedLocation);
    } catch (err: any) {
      setError(err.message || 'Failed to load location data');
      console.error('Error fetching location data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger refresh for child components
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchLocationData();
  };

  // Initial load is now handled by the authentication useEffect above

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading management dashboard..." />
      </div>
    );
  }

  if (error && !assignedLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          error={error} 
          onRetry={fetchLocationData}
          title="Failed to Load Dashboard"
        />
      </div>
    );
  }

  const tabs = [
    {
      id: 'sessions' as const,
      label: 'Parking Sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Create and manage parking sessions'
    },
    {
      id: 'validate' as const,
      label: 'Vehicle Validation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Validate parked vehicles'
    },
    {
      id: 'overstay' as const,
      label: 'Overstay Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      description: 'Handle overstayed vehicles and payments'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AttendantHeader 
        assignedLocation={assignedLocation}
        lastUpdated={new Date().toISOString()}
        refreshing={false}
        onRefresh={handleRefresh}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parking Management
          </h1>
          <p className="text-gray-600">
            Manage parking sessions, validate vehicles, and handle payments for your assigned location.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`mr-2 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Descriptions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Error Message (if error but we have cached data) */}
        {error && assignedLocation && (
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
                    <p>Some features may not work properly: {error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
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
        </div>
      </div>
    </div>
  );
}
