import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import AuthModal from '../auth/AuthModal';
import PaymentModal from '../payment/PaymentModal';
import TextField from '../fields/TextField';
import SelectField from '../fields/SelectField';
import Button from '../fields/Button';
import { Location, Slot } from '@/types';
import { createBooking } from '@/services/bookings.service';

interface SearchBoxProps {
  formData: {
    plateNumber: string;
    location: string;
    date: string;
    time: string;
    slot: string;
    startDateTime?: string;
  };
  locations: Location[];
  availableSlots: Slot[];
  selectedLocation: Location | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClearLocation: () => void;
}

const SearchBox = ({
  formData,
  locations,
  availableSlots,
  selectedLocation,
  onInputChange,
  onSubmit,
  onClearLocation
}: SearchBoxProps) => {
  const { user } = useUserStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedLocation) {
      setError('Please select a location');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const bookingData = {
        startDateTime: formData.startDateTime,
        time: formData.time,
        slotId: formData.slot,
        plateNumber: formData.plateNumber,
      };

      const response = await createBooking(bookingData);
      setCurrentBooking(response.booking);
      setIsPaymentModalOpen(true);
    } catch (err) {
      setError('Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-8 backdrop-blur-lg backdrop-filter">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <TextField
            id="plateNumber"
            name="plateNumber"
            label="Plate Number"
            value={formData.plateNumber}
            onChange={onInputChange}
            placeholder="ABC 123"
            required
          />

          <SelectField
            id="location"
            name="location"
            label="Location"
            value={formData.location}
            onChange={onInputChange}
            options={locations.map(loc => ({ id: loc.documentId, name: loc.name }))}
            required
            allowClear
            onClear={onClearLocation}
          />

          <div className="p-6 hover:bg-gray-50/50 transition group relative">
            <label 
              htmlFor="startDateTime"
              className="block text-xs font-medium text-gray-600 mb-1.5 group-hover:text-blue-600 transition"
            >
              Start Time
            </label>
            <div className="relative">
              <input
                id="startDateTime"
                name="startDateTime"
                type="datetime-local"
                value={formData.startDateTime || ''}
                onChange={onInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border-0 p-0 pr-8 focus:ring-0 text-lg text-gray-900 font-medium bg-transparent appearance-none"
                placeholder="Select start time"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to start now
            </p>
          </div>

          <div className="p-6 hover:bg-gray-50/50 transition group relative">
            <label 
              htmlFor="time"
              className="block text-xs font-medium text-gray-600 mb-1.5 group-hover:text-blue-600 transition"
            >
              Duration
            </label>
            <div className="relative">
              <input
                id="time"
                name="time"
                type="number"
                min="1"
                max="24"
                value={formData.time}
                onChange={onInputChange}
                className="w-full border-0 p-0 pr-8 focus:ring-0 text-lg text-gray-900 font-medium bg-transparent appearance-none"
                placeholder="Select hours (1-24)"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">hours</span>
              </div>
            </div>
          </div>

          <SelectField
            id="slot"
            name="slot"
            label="Parking Slot"
            value={formData.slot}
            onChange={onInputChange}
            options={selectedLocation ? availableSlots.map(slot => ({
              id: slot.documentId,
              name: `${slot.name} (${slot.type})`
            })) : []}
            required
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-b-2xl flex justify-center border-t border-gray-100">
          <Button
            type="submit"
            variant={user ? "primary" : "secondary"}
            disabled={!user || isLoading}
          >
            {isLoading ? 'Booking...' : 'Book Now'}
          </Button>
        </div>
      </form>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={currentBooking}
        amount={currentBooking?.totalPrice || 0}
      />
    </div>
  );
};

export default SearchBox; 