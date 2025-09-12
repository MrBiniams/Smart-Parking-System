import { create } from 'zustand';
import { Location, Slot, BookingData } from '@/types';

interface BookingState {
  selectedLocation: Location | null;
  selectedSlot: Slot | null;
  bookingData: BookingData | null;
  setSelectedLocation: (location: Location | null) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  setBookingData: (data: BookingData | null) => void;
  resetBooking: () => void;
}

type SetState = (
  partial: BookingState | Partial<BookingState> | ((state: BookingState) => BookingState | Partial<BookingState>),
  replace?: boolean
) => void;

const useStore = create<BookingState>((set: SetState) => ({
  selectedLocation: null,
  selectedSlot: null,
  bookingData: null,
  setSelectedLocation: (location: Location | null) => set({ selectedLocation: location }),
  setSelectedSlot: (slot: Slot | null) => set({ selectedSlot: slot }),
  setBookingData: (data: BookingData | null) => set({ bookingData: data }),
  resetBooking: () => set({ 
    selectedLocation: null, 
    selectedSlot: null, 
    bookingData: null 
  }),
}));

export default useStore; 