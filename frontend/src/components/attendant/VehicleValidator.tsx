'use client';

import React, { useState } from 'react';
import { AttendantLocation } from '../../types/attendant';
import { attendantService } from '../../services/attendantService';

interface VehicleValidatorProps {
  assignedLocation: AttendantLocation | null;
  refreshTrigger: number;
}

interface ValidationResult {
  valid: boolean;
  isOverstayed: boolean;
  booking: any;
  overstayDetails: any;
  message: string;
}

export default function VehicleValidator({ 
  assignedLocation, 
  refreshTrigger 
}: VehicleValidatorProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate vehicle
  const handleValidateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    alert('Function called! Plate: ' + plateNumber);
    
    if (!plateNumber.trim()) {
      setError('Please enter a license plate number');
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setValidationResult(null);

      const result = await attendantService.validateVehicle(plateNumber.trim());
      
      // Debug alert to see what we're getting
      alert(`Debug: valid=${result.valid}, isOverstayed=${result.isOverstayed}, message=${result.message}`);
      
      setValidationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to validate vehicle');
    } finally {
      setValidating(false);
    }
  };

  // Clear results
  const handleClear = () => {
    setPlateNumber('');
    setValidationResult(null);
    setError(null);
  };

  // Format time remaining
  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Get status color and icon
  const getStatusDisplay = (result: ValidationResult) => {
    if (result.valid) {
      return {
        color: 'text-green-600 bg-green-100',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Valid Parking'
      };
    } else if (result.isOverstayed) {
      return {
        color: 'text-red-600 bg-red-100',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: 'Overstayed'
      };
    } else {
      return {
        color: 'text-yellow-600 bg-yellow-100',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        title: 'Invalid/Not Found'
      };
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vehicle Validation
        </h2>
        <p className="text-sm text-gray-600">
          Enter a license plate number to validate parking status and check for overstays.
        </p>
      </div>

      {/* Validation Form */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <form onSubmit={handleValidateVehicle} className="space-y-4">
          <div>
            <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-2">
              License Plate Number
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="plateNumber"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="ABC-1234"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono text-gray-900 bg-white"
                disabled={validating}
              />
              <button
                type="submit"
                disabled={validating || !plateNumber.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating...
                  </div>
                ) : (
                  'Validate'
                )}
              </button>
              {(validationResult || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>
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
              <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Status Header */}
          <div className={`px-6 py-4 border-b border-gray-200 ${getStatusDisplay(validationResult).color}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getStatusDisplay(validationResult).icon}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">
                  {getStatusDisplay(validationResult).title}
                </h3>
                <p className="text-sm opacity-90">
                  {validationResult.message}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {validationResult.booking && (
            <div className="px-6 py-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Booking Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                    <p className="text-sm font-medium text-gray-900">
                      {validationResult.booking.user.firstName} {validationResult.booking.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {validationResult.booking.user.phoneNumber}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Slot</p>
                    <p className="text-sm font-medium text-gray-900">
                      {validationResult.booking.slot.slotNumber}
                    </p>
                  </div>
                </div>

                {/* Time Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Parking Period</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(validationResult.booking.startTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      to {new Date(validationResult.booking.endTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        validationResult.booking.bookingStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {validationResult.booking.bookingStatus}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        validationResult.booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {validationResult.booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Remaining or Overstay Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {validationResult.valid ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Remaining:</span>
                    <span className="text-sm font-medium text-green-600">
                      {getTimeRemaining(validationResult.booking.endTime)}
                    </span>
                  </div>
                ) : validationResult.isOverstayed && validationResult.overstayDetails ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h5 className="text-sm font-medium text-red-800 mb-2">Overstay Details</h5>
                    <div className="space-y-2 text-sm text-red-700">
                      <div className="flex justify-between">
                        <span>Overstay Duration:</span>
                        <span className="font-medium">
                          {Math.floor(validationResult.overstayDetails.overstayMinutes / 60)}h {validationResult.overstayDetails.overstayMinutes % 60}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Cost:</span>
                        <span className="font-medium">
                          ${validationResult.overstayDetails.additionalCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grace Period Used:</span>
                        <span className="font-medium">
                          {validationResult.overstayDetails.gracePeriodMinutes} minutes
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Total Cost */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-900">Total Cost:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${(validationResult.booking.totalPrice + (validationResult.overstayDetails?.additionalCost || 0)).toFixed(2)}
                  </span>
                </div>
                {validationResult.overstayDetails?.additionalCost > 0 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Original: ${validationResult.booking.totalPrice.toFixed(2)} + 
                    Overstay: ${validationResult.overstayDetails.additionalCost.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Quick Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Enter license plate numbers without spaces or dashes</li>
                <li>Green status means the vehicle has valid parking</li>
                <li>Red status indicates overstay - payment may be required</li>
                <li>Yellow status means no active booking found</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
