'use client';

import React from 'react';
import { BookingStatus } from '@/types/attendant';

interface AttendantFiltersProps {
  statusFilter: BookingStatus[];
  onStatusFilterChange: (statuses: BookingStatus[]) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
}

export default function AttendantFilters({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange
}: AttendantFiltersProps) {
  const statusOptions: { value: BookingStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const handleStatusToggle = (status: BookingStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter(s => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  const clearAllFilters = () => {
    onStatusFilterChange([]);
    onSearchTermChange('');
    onDateRangeChange(null);
  };

  const hasActiveFilters = statusFilter.length > 0 || searchTerm || dateRange;

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const setTodayFilter = () => {
    const today = getTodayDate();
    onDateRangeChange({ start: today, end: today });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search by plate number, customer name, or phone..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusToggle(option.value)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  statusFilter.includes(option.value)
                    ? `${option.color} ring-2 ring-blue-500 ring-offset-1`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusFilter.includes(option.value) && (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="date"
                value={dateRange?.start || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateRangeChange({
                      start: e.target.value,
                      end: dateRange?.end || e.target.value
                    });
                  } else {
                    onDateRangeChange(null);
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="flex-1">
              <input
                type="date"
                value={dateRange?.end || ''}
                onChange={(e) => {
                  if (e.target.value && dateRange?.start) {
                    onDateRangeChange({
                      start: dateRange.start,
                      end: e.target.value
                    });
                  }
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={setTodayFilter}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Active filters:</span>
            {statusFilter.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {statusFilter.length} status{statusFilter.length !== 1 ? 'es' : ''}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Search: "{searchTerm}"
              </span>
            )}
            {dateRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {dateRange.start === dateRange.end ? dateRange.start : `${dateRange.start} - ${dateRange.end}`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
