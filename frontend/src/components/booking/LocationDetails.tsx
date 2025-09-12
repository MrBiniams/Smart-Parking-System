import React from 'react';
import { Location, Slot } from '@/types';

interface LocationDetailsProps {
  location: Location;
  availableSlots: Slot[];
  showSlotGrid: boolean;
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
}

export default function LocationDetails({
  location,
  availableSlots,
  showSlotGrid,
  selectedSlot,
  onSlotSelect
}: LocationDetailsProps) {
  console.log('Location data:', location); // Debug log

  // Early return if location is not provided
  if (!location) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg backdrop-filter p-4">
        <div className="text-center text-gray-500">No location selected</div>
      </div>
    );
  }

  const getSlotColor = (slot: Slot) => {
    if (!slot) return 'bg-gray-50 border-gray-200 text-gray-700';
    if (slot.slotStatus === 'occupied') return 'bg-red-50 border-red-200 text-red-700';
    if (slot.slotStatus === 'reserved') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    if (selectedSlot?.documentId === slot.documentId) return 'bg-blue-50 border-blue-500 text-blue-700';
    return 'bg-green-50 border-green-200 text-green-700 hover:border-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg backdrop-filter">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{location.name}</h3>
            <p className="text-sm text-gray-600">{location.address}</p>
            {showSlotGrid && (
              <p className="text-xs text-blue-600 mt-0.5">
                {availableSlots.length} slots available
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold text-gray-800">Parking Slots</h4>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Occupied
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Reserved
            </span>
          </div>
        </div>
        
        <div className="h-[400px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.documentId}
                onClick={() => onSlotSelect(slot)}
                disabled={slot?.slotStatus === 'occupied' || slot?.slotStatus === 'reserved'}
                className={`p-2 rounded-lg border transition-all ${getSlotColor(slot)} ${
                  slot?.slotStatus === 'occupied' || slot?.slotStatus === 'reserved' ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                }`}
              >
                <div className="text-center">
                  <div className="text-sm font-semibold mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{slot?.name || 'Unknown'}</div>
                  <div className="text-xs capitalize">{slot?.type || 'Standard'}</div>
                  <div className={`text-[10px] mt-0.5 px-1.5 py-0.5 rounded-full inline-block capitalize ${getStatusColor(slot?.slotStatus || 'unknown')}`}>
                    {slot?.slotStatus || 'unknown'}
                  </div>
                  {slot?.price && (
                    <div className="text-xs mt-1 font-medium">
                      ${slot.price}/hr
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 