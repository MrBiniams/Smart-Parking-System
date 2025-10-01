'use client';

import React from 'react';
import { AttendantBooking } from '@/types/attendant';

interface AttendantStatsProps {
  bookings: AttendantBooking[];
}

export default function AttendantStats({ bookings }: AttendantStatsProps) {
  // Calculate stats
  const today = new Date().toDateString();
  
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.bookingStatus === 'active').length,
    completed: bookings.filter(b => 
      b.bookingStatus === 'completed' && 
      new Date(b.startTime).toDateString() === today
    ).length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    revenue: bookings
      .filter(b => 
        b.paymentStatus === 'paid' && 
        new Date(b.startTime).toDateString() === today
      )
      .reduce((sum, b) => sum + b.totalPrice, 0)
  };

  const statCards = [
    {
      title: 'Active Bookings',
      value: stats.active,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-900'
    },
    {
      title: 'Completed Today',
      value: stats.completed,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900'
    },
    {
      title: "Today's Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} border-2 rounded-lg p-6 transition-all duration-200 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          
          {/* Optional trend indicator */}
          {index === 0 && stats.active > 0 && (
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Currently active</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
