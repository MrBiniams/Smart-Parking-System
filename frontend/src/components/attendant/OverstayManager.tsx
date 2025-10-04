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
      
      // Debug log to check the received data
      console.log('Overstayed vehicles response:', response);
      console.log('First vehicle user data:', response.data[0]?.booking?.user);
      
      setOverstayedVehicles(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overstayed vehicles');
      console.error('Error fetching overstayed vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Contact customer function
  const handleContactCustomer = (vehicle: OverstayedVehicle) => {
    const customerName = `${vehicle.booking.user?.firstName || 'Customer'} ${vehicle.booking.user?.lastName || ''}`.trim();
    const phoneNumber = vehicle.booking.user?.phoneNumber;
    const email = vehicle.booking.user?.email;
    const plateNumber = vehicle.booking.plateNumber;
    const overstayDuration = formatDuration(vehicle.overstayMinutes);
    const additionalCost = vehicle.additionalCost.toFixed(2);

    // Debug log to check user data
    console.log('Contact customer - vehicle data:', {
      customerName,
      phoneNumber,
      email,
      plateNumber,
      fullUser: vehicle.booking.user
    });

    // Create detailed instructions for the attendant
    const instructions = `🚗 OVERSTAY ALERT - ACTION REQUIRED\n\n` +
      `Vehicle: ${plateNumber}\n` +
      `Customer: ${customerName}\n` +
      `Overstayed: ${overstayDuration}\n` +
      `Additional Cost: $${additionalCost}\n\n` +
      
      `📋 ATTENDANT INSTRUCTIONS:\n\n` +
      
      `1️⃣ CONTACT CUSTOMER:\n` +
      `   📞 Phone: ${phoneNumber || 'NOT AVAILABLE'}\n` +
      `   ✉️ Email: ${email || 'NOT AVAILABLE'}\n\n` +
      
      `2️⃣ WHAT TO SAY:\n` +
      `   "Hello ${customerName}, this is Smart Parking.\n` +
      `   Your vehicle ${plateNumber} has overstayed by ${overstayDuration}.\n` +
      `   Please return to settle the additional payment of $${additionalCost}."\n\n` +
      
      `3️⃣ IF CUSTOMER DOESN'T ANSWER:\n` +
      `   • Try calling 2-3 times with 5-minute intervals\n` +
      `   • Send SMS if available\n` +
      `   • Document attempts in system notes\n\n` +
      
      `4️⃣ IF CUSTOMER RETURNS:\n` +
      `   • Process payment using the "Process Payment" button\n` +
      `   • Select appropriate payment method\n` +
      `   • Provide receipt\n\n` +
      
      `5️⃣ IF NO RESPONSE AFTER 30 MINUTES:\n` +
      `   • Contact supervisor\n` +
      `   • Consider towing procedures\n` +
      `   • Document all actions taken\n\n` +
      
      `Click OK to copy customer phone number to clipboard.`;

    if (confirm(instructions)) {
      if (phoneNumber) {
        // Copy phone number to clipboard
        navigator.clipboard.writeText(phoneNumber).then(() => {
          alert(`✅ Phone number copied!\n\n${phoneNumber}\n\nYou can now call the customer.`);
        }).catch(() => {
          alert(`📞 Customer Phone: ${phoneNumber}\n\nPlease call this number manually.`);
        });
      } else {
        alert(`❌ No phone number available for ${customerName}.\n\nContact your supervisor for alternative contact methods.`);
      }
    }
  };

  // Process overstay payment
  const handleProcessPayment = async (bookingId: string, paymentMethod: string) => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const vehicle = overstayedVehicles.find(v => v.booking.documentId === bookingId);
    const customerName = vehicle ? `${vehicle.booking.user?.firstName || ''} ${vehicle.booking.user?.lastName || ''}`.trim() : 'Customer';
    const amount = vehicle?.additionalCost.toFixed(2) || '0.00';

    if (!confirm(`Process ${paymentMethod.toUpperCase()} payment of $${amount} for ${customerName}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setProcessingPayment(bookingId);
      setError(null);

      console.log('Processing payment:', { bookingId, paymentMethod });

      const result = await attendantService.processOverstayPayment(bookingId, paymentMethod as any);
      
      console.log('Payment result:', result);
      
      // Show success message with receipt number
      alert(`✅ Payment processed successfully!\n\n` +
            `Receipt Number: ${result.receiptNumber}\n` +
            `Amount: $${amount}\n` +
            `Method: ${paymentMethod.toUpperCase()}\n` +
            `Customer: ${customerName}`);
      
      // Refresh the list
      await fetchOverstayedVehicles();
      
      // Clear selected payment method
      setSelectedPaymentMethod(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    } catch (err: any) {
      console.error('Payment processing error:', err);
      const errorMessage = err.message || 'Failed to process payment';
      setError(`Payment failed: ${errorMessage}`);
      alert(`❌ Payment Failed\n\n${errorMessage}\n\nPlease try again or contact support.`);
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
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer Information</p>
                    {vehicle.booking.user ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">
                          {vehicle.booking.user.firstName || 'Unknown'} {vehicle.booking.user.lastName || 'Customer'}
                        </p>
                        <p className="text-sm text-gray-600">
                          📞 {vehicle.booking.user.phoneNumber || 'No phone number'}
                        </p>
                        {vehicle.booking.user.email && (
                          <p className="text-sm text-gray-600">
                            ✉️ {vehicle.booking.user.email}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-red-600">
                          ⚠️ Customer data not available
                        </p>
                        <p className="text-xs text-gray-500">
                          Contact system administrator
                        </p>
                      </>
                    )}
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
                <h4 className="text-sm font-medium text-gray-900 mb-3">💰 Overstay Calculation Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Total Overstay</p>
                    <p className="font-medium text-gray-900">
                      {formatDuration(vehicle.overstayMinutes)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Grace Period</p>
                    <p className="font-medium text-green-600">
                      -{vehicle.gracePeriodMinutes} min (FREE)
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
                
                {/* Calculation Formula */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
                  <p className="font-medium text-blue-800 mb-1">📊 How it's calculated:</p>
                  <p className="text-blue-700">
                    <span className="font-mono">
                      ({formatDuration(vehicle.overstayMinutes)} - {vehicle.gracePeriodMinutes}min grace) × ${vehicle.hourlyRate}/hr = ${vehicle.additionalCost.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-blue-600 mt-1">
                    ℹ️ Billing rounds up to the next hour after grace period
                  </p>
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

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Contact Customer Button */}
                  <button
                    onClick={() => handleContactCustomer(vehicle)}
                    className="px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact Customer
                    </div>
                  </button>

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
                    className="px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
