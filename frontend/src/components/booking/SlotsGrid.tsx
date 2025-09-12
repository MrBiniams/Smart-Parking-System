import React from 'react';
import { Slot } from '@/types';

interface SlotsGridProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
}

export default function SlotsGrid({ slots, selectedSlot, onSlotSelect }: SlotsGridProps) {
  const getSlotColor = (slot: Slot) => {
    if (selectedSlot?.documentId === slot.documentId) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }
    switch (slot.slotStatus) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 cursor-not-allowed';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 cursor-not-allowed';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Slots</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.documentId}
            onClick={() => onSlotSelect(slot)}
            disabled={slot.slotStatus !== 'available'}
            className={`
              p-3 rounded-lg text-sm font-medium transition-all duration-200
              ${getSlotColor(slot)}
              ${slot.slotStatus === 'available' ? 'cursor-pointer' : 'cursor-not-allowed'}
              flex flex-col items-center justify-center gap-1
              min-h-[80px] sm:min-h-[100px]
              min-w-[100px]
              border border-transparent hover:border-blue-200
              shadow-sm hover:shadow-md
            `}
          >
            <span className="text-lg font-bold">{slot.name}</span>
            <span className="text-xs capitalize">{slot.type}</span>
            {slot.slotStatus === 'available' && (
              <span className="text-xs font-medium">
                {slot.price ? `ETB ${slot.price}/hr` : 'Free'}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
} 