'use client';

import React from 'react';
import { AttendantLocation } from '@/types/attendant';

interface AttendantHeaderProps {
  assignedLocation: AttendantLocation | null;
  lastUpdated: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function AttendantHeader({
  assignedLocation,
  lastUpdated,
  refreshing,
  onRefresh
}: AttendantHeaderProps) {
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleString();
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            {/* Left side - Location info */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Attendant Dashboard
                </h1>
                {assignedLocation ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-sm text-gray-600">
                      Managing: <span className="font-medium text-gray-900">{assignedLocation.name}</span>
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 mt-1">
                    No location assigned
                  </p>
                )}
              </div>
            </div>

            {/* Right side - Actions and status */}
            <div className="flex items-center space-x-4">
              {/* Last updated */}
              {lastUpdated && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatLastUpdated(lastUpdated)}
                  </p>
                </div>
              )}

              {/* Refresh button */}
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg 
                  className={`-ml-1 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Auto-refresh indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Auto-refresh: 30s</span>
              </div>
            </div>
          </div>

          {/* Location address */}
          {assignedLocation?.address && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{assignedLocation.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
