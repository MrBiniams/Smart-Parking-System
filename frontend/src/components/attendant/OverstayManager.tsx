'use client';

import React, { useState, useEffect } from 'react';
import { AttendantLocation } from '../../types/attendant';
import { attendantService } from '../../services/attendantService';

interface OverstayManagerProps {
  assignedLocation: AttendantLocation | null;
  refreshTrigger: number;
}

interface OverstayedVehicle {
  isOverstayed: boolean;
  overstayMinutes: number;
  overstayHours: number;
  additionalCost: number;
  gracePeriodMinutes: number;
  hourlyRate: number;
  booking: {
    id: string;
    documentId: string;
    plateNumber: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    user: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
    };
    slot: {
      slotNumber: string;
    };
  };
}

export default function OverstayManager({ 
  assignedLocation, 
  refreshTrigger 
}: OverstayManagerProps) {
  const [overstayedVehicles, setOverstayedVehicles] = useState<OverstayedVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{[key: string]: string}>({});

  // Fetch overstayed vehicles
  const fetchOverstayedVehicles = async () => {
    if (!assignedLocation) return;

    try {
      setLoading(true);
      setError(null);

      const response = await attendantService.getOverstayedVehicles();
      setOverstayedVehicles(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overstayed vehicles');
      console.error('Error fetching overstayed vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process overstay payment
  const handleProcessPayment = async (bookingId: string, paymentMethod: string) => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!confirm('Are you sure you want to process this overstay payment?')) {
      return;
    }

    try {
      setProcessingPayment(bookingId);
      setError(null);

      const result = await attendantService.processOverstayPayment(bookingId, paymentMethod as any);
      
      // Show success message with receipt number
      alert(`Payment processed successfully!\nReceipt Number: ${result.receiptNumber}`);
      
      // Refresh the list
      fetchOverstayedVehicles();
      
      // Clear selected payment method
      setSelectedPaymentMethod(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };

  // Get severity color based on overstay duration
  const getSeverityColor = (overstayMinutes: number) => {
    if (overstayMinutes <= 30) {
      return 'border-yellow-300 bg-yellow-50';
    } else if (overstayMinutes <= 120) {
      return 'border-orange-300 bg-orange-50';
    } else {
      return 'border-red-300 bg-red-50';
    }
  };

  useEffect(() => {
    fetchOverstayedVehicles();
  }, [assignedLocation, refreshTrigger]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOverstayedVehicles();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [assignedLocation]);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'pos', label: 'POS/Card', icon: '💳' },
    { value: 'telebirr', label: 'TeleBirr', icon: '📱' },
    { value: 'manual', label: 'Manual Entry', icon: '✏️' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Overstayed Vehicles
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {overstayedVehicles.length} vehicle{overstayedVehicles.length !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        
        <button
          onClick={fetchOverstayedVehicles}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
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

      {/* Overstayed Vehicles List */}
      {loading && overstayedVehicles.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading overstayed vehicles...</p>
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
          {overstayedVehicles.map((vehicle) => (
            <div
              key={vehicle.booking.documentId}
              className={`border-2 rounded-lg p-6 ${getSeverityColor(vehicle.overstayMinutes)}`}
            >
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {vehicle.booking.plateNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Slot {vehicle.booking.slot.slotNumber}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Overstayed {formatDuration(vehicle.overstayMinutes)}
                  </span>
                </div>
              </div>

              {/* Customer and Time Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-medium text-gray-900">
                      {vehicle.booking.user.firstName} {vehicle.booking.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vehicle.booking.user.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Parking Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(vehicle.booking.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-red-600 font-medium">
                      Expired: {new Date(vehicle.booking.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overstay Details */}
              <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Overstay Calculation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Overstay</p>
                    <p className="font-medium text-gray-900">
                      {formatDuration(vehicle.overstayMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Grace Period</p>
                    <p className="font-medium text-gray-900">
                      {vehicle.gracePeriodMinutes} min
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hourly Rate</p>
                    <p className="font-medium text-gray-900">
                      ${vehicle.hourlyRate}/hr
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Additional Cost</p>
                    <p className="font-semibold text-red-600">
                      ${vehicle.additionalCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex items-center justify-between mb-6 p-4 bg-white bg-opacity-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">
                    Original: ${vehicle.booking.totalPrice.toFixed(2)} + Overstay: ${vehicle.additionalCost.toFixed(2)}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    Total Due: ${(vehicle.booking.totalPrice + vehicle.additionalCost).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Process Payment</h4>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setSelectedPaymentMethod(prev => ({
                        ...prev,
                        [vehicle.booking.documentId]: method.value
                      }))}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                        selectedPaymentMethod[vehicle.booking.documentId] === method.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      disabled={processingPayment === vehicle.booking.documentId}
                    >
                      <div className="text-center">
                        <div className="text-lg mb-1">{method.icon}</div>
                        <div>{method.label}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Process Payment Button */}
                <button
                  onClick={() => handleProcessPayment(
                    vehicle.booking.documentId,
                    selectedPaymentMethod[vehicle.booking.documentId]
                  )}
                  disabled={
                    processingPayment === vehicle.booking.documentId || 
                    !selectedPaymentMethod[vehicle.booking.documentId]
                  }
                  className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayment === vehicle.booking.documentId ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </div>
                  ) : (
                    `Process ${selectedPaymentMethod[vehicle.booking.documentId] ? 
                      paymentMethods.find(m => m.value === selectedPaymentMethod[vehicle.booking.documentId])?.label : 'Payment'
                    } - $${vehicle.additionalCost.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Auto-refreshes every 2 minutes • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
