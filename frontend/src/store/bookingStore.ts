import { create } from 'zustand';
import { Location, Slot } from '@/types';
import { fetchLocations, fetchSlotsByLocation } from '@/services/api';

interface FormData {
  plateNumber: string;
  location: string;
  date: string;
  time: string;
  slot: string;
}

interface BookingState {
  // State
  locations: Location[];
  selectedLocation: Location | null;
  slots: Slot[];
  selectedSlot: Slot | null;
  userLocation: { lat: number; lng: number } | null;
  formData: FormData;
  isLoading: boolean;
  error: string | null;
  showPaymentModal: boolean;
  showSlotGrid: boolean;

  // Actions
  setLocations: (locations: Location[]) => void;
  setSelectedLocation: (location: Location | null) => void;
  setSlots: (slots: Slot[]) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setFormData: (data: Partial<FormData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowPaymentModal: (show: boolean) => void;
  setShowSlotGrid: (show: boolean) => void;
  handleLocationSelect: (location: Location) => void;
  handleSlotSelect: (slot: Slot) => void;
  loadLocations: () => Promise<void>;
  loadSlots: (locationId: string) => Promise<void>;
  resetBooking: () => void;
}

// Get current date and time
const now = new Date();
const currentDate = now.toISOString().split('T')[0];
const currentTime = now.toTimeString().slice(0, 5);

const initialFormData: FormData = {
  plateNumber: '',
  location: '',
  date: currentDate,
  time: currentTime,
  slot: ''
};

export const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  locations: [],
  selectedLocation: null,
  slots: [],
  selectedSlot: null,
  userLocation: null,
  formData: initialFormData,
  isLoading: false,
  error: null,
  showPaymentModal: false,
  showSlotGrid: false,

  // Actions
  setLocations: (locations) => set({ locations }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSlots: (slots) => set({ slots }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setUserLocation: (location) => set({ userLocation: location }),
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setShowPaymentModal: (show) => set({ showPaymentModal: show }),
  setShowSlotGrid: (show) => set({ showSlotGrid: show }),

  handleLocationSelect: (location) => {
    set((state) => ({
      selectedLocation: location,
      formData: { ...state.formData, location: location.documentId },
      showSlotGrid: true
    }));
  },

  handleSlotSelect: (slot) => {
    if (slot.slotStatus === 'available') {
      set((state) => ({
        selectedSlot: slot,
        formData: { ...state.formData, slot: slot.documentId }
      }));
    }
  },

  loadLocations: async () => {
    try {
      set({ isLoading: true, error: null });
      const locationsData = await fetchLocations();
      set({ locations: locationsData, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load locations', isLoading: false });
    }
  },

  loadSlots: async (locationId: string) => {
    try {
      set({ isLoading: true, error: null });
      const slotsData = await fetchSlotsByLocation(locationId);
      set({ slots: slotsData as Slot[], isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load slots', isLoading: false });
    }
  },

  resetBooking: () => {
    set({
      selectedLocation: null,
      selectedSlot: null,
      slots: [],
      formData: initialFormData,
      showSlotGrid: false,
      showPaymentModal: false,
      error: null
    });
  }
})); 