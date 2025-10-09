import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  // Try multiple token storage locations for compatibility
  let token = null;
  
  // First, try the direct token storage (used by auth service)
  token = localStorage.getItem('token');
  
  // Fallback to user-storage format (legacy)
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user-storage') || '{}');
    token = user?.state?.token;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Location {
  id: string;
  documentId: string;
  name: string;
  address: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours?: any[];
  totalSlots: number;
  availableSlots: number;
  image?: any;
}

export interface Slot {
  id: string;
  name: string;
  documentId: string;
  slotStatus: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'standard' | 'premium' | 'disabled' | 'electric';
  coordinates: {
    lat: number;
    lng: number;
  };
  location?: {
    id: string;
    name: string;
    address: string;
  };
  currentBooking?: {
    id: string;
    startTime: string;
    endTime: string;
    bookingStatus: string;
  };
  price?: number;
  features?: any;
}

export interface Booking {
  id: string;
  documentId?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
    phoneNumber?: string;
  };
  slot?: {
    id: string;
    name: string;
    type: string;
  };
  location?: {
    id: string;
    name: string;
    address: string;
  };
  startTime: string;
  endTime: string;
  plateNumber: string;
  bookingStatus: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalPrice?: number;
  paymentMethod?: 'telebirr' | 'cbe-birr';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

// Location API
export const locationService = {
  async getAll(): Promise<{ data: Location[] }> {
    const response = await api.get('/api/locations');
    return response.data;
  },

  async getById(id: string): Promise<{ data: Location }> {
    const response = await api.get(`/api/locations/${id}`);
    return response.data;
  },

  async getSlots(locationId: string): Promise<{ data: Slot[] }> {
    const response = await api.get(`/api/locations/${locationId}/slots`);
    return response.data;
  },
};

// Slot API
export const slotService = {
  async getAll(): Promise<{ data: Slot[] }> {
    const response = await api.get('/api/slots');
    return response.data;
  },

  async getById(id: string): Promise<{ data: Slot }> {
    const response = await api.get(`/api/slots/${id}`);
    return response.data;
  },

  async getByLocation(locationId: string): Promise<{ data: Slot[] }> {
    const response = await api.get(`/api/slots/location/${locationId}`);
    return response.data;
  },

  async getAvailable(): Promise<{ data: Slot[] }> {
    const response = await api.get('/api/slots/available');
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<{ data: Slot }> {
    const response = await api.put(`/api/slots/${id}/status`, { status });
    return response.data;
  },
};

// Booking API
export const bookingService = {
  async getAll(): Promise<{ data: Booking[] }> {
    const response = await api.get('/api/bookings');
    return response.data;
  },

  async getById(id: string): Promise<{ data: Booking }> {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  async getByUser(userId: string): Promise<{ data: Booking[] }> {
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  },

  async getBySlot(slotId: string): Promise<{ data: Booking[] }> {
    const response = await api.get(`/api/bookings/slot/${slotId}`);
    return response.data;
  },

  async create(data: Partial<Booking>): Promise<{ data: Booking }> {
    const response = await api.post('/api/bookings', { data });
    return response.data;
  },

  async update(id: string, data: Partial<Booking>): Promise<{ data: Booking }> {
    const response = await api.put(`/api/bookings/${id}`, { data });
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<{ data: Booking }> {
    const response = await api.put(`/api/bookings/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/bookings/${id}`);
  },

  async getAttendantBookings(locationId: string): Promise<{ data: Booking[] }> {
    const response = await api.get(`/api/bookings/attendant/${locationId}`);
    return response.data;
  },

  async createAttendantBooking(bookingData: {
    plateNumber: string;
    slotId: string;
    time: number;
    startDateTime?: string;
    phoneNumber: string;
  }): Promise<{ booking: Booking }> {
    const response = await api.post('/api/bookings/attendant', bookingData);
    return response.data;
  },
};

// Legacy functions for backward compatibility
export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await locationService.getAll();
    return response.data.map((loc: any) => ({
      id: loc.id,
      documentId: loc.documentId,
      name: loc.name,
      address: loc.address,
      description: loc.description,
      coordinates: loc.coordinates,
      openingHours: loc.openingHours,
      totalSlots: loc.totalSlots,
      availableSlots: loc.availableSlots,
      image: loc.image?.data
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const fetchSlotsByLocation = async (locationId: string): Promise<Slot[]> => {
  try {
    const response = await slotService.getByLocation(locationId);
    return response.data.map((slot: any) => ({
      id: slot.id,
      documentId: slot.documentId,
      name: slot.name,
      slotStatus: slot.slotStatus,
      type: slot.type,
      coordinates: slot.coordinates,
      location: slot.location ? {
        id: slot.location.id,
        name: slot.location.name,
        address: slot.location.address
      } : undefined,
      currentBooking: slot.currentBooking ? {
        id: slot.currentBooking.id,
        documentId: slot.currentBooking.documentId,
        startTime: slot.currentBooking.startTime,
        endTime: slot.currentBooking.endTime,
        bookingStatus: slot.currentBooking.bookingStatus
      } : undefined,
      price: slot.price,
      features: slot.features
    }));
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

export const fetchAttendantBookings = async (locationId: string): Promise<Booking[]> => {
  try {
    const response = await bookingService.getAttendantBookings(locationId);
    return response.data.map((booking: any): Booking => ({
      id: booking.id,
      documentId: booking.documentId,
      plateNumber: booking.plateNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      user: booking.user ? {
        id: booking.user.id,
        username: booking.user.username,
        phoneNumber: booking.user.phoneNumber,
        email: booking.user.email
      } : undefined,
      slot: booking.slot ? {
        id: booking.slot.id,
        name: booking.slot.name,
        type: booking.slot.type
      } : undefined,
      location: booking.location ? {
        id: booking.location.id,
        name: booking.location.name,
        address: booking.location.address
      } : undefined
    }));
  } catch (error) {
    console.error('Error fetching attendant bookings:', error);
    throw error;
  }
};

export const createAttendantBooking = async (bookingData: {
  plateNumber: string;
  slotId: string;
  time: number;
  startDateTime?: string;
  phoneNumber: string;
}): Promise<Booking> => {
  try {
    const response = await bookingService.createAttendantBooking(bookingData);
    return response.booking;
  } catch (error) {
    console.error('Error creating attendant booking:', error);
    throw error;
  }
};

export default api; 