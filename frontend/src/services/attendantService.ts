import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useUserStore } from '../store/userStore';

// Import the main type instead of redefining it
import { AttendantBooking, AttendantLocation } from '../types/attendant';

export interface AttendantBookingsResponse {
  data: AttendantBooking[];
  meta: {
    assignedLocation: AttendantLocation;
  };
}

export interface AttendantApiError {
  message: string;
  status: number;
}

class AttendantService {
  private getAuthHeaders() {
    // Get token from Zustand store instead of localStorage directly
    const token = useUserStore.getState().token;
    const localStorageToken = localStorage.getItem('token');
    
    console.log('=== ATTENDANT SERVICE AUTH DEBUG ===');
    console.log('Token from Zustand store:', token);
    console.log('Token from localStorage:', localStorageToken);
    console.log('Using token:', token || localStorageToken);
    console.log('====================================');
    
    return {
      'Authorization': `Bearer ${token || localStorageToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch bookings for the attendant's assigned location
   * This endpoint is secure - it automatically uses the attendant's assigned location
   */
  async getMyLocationBookings(): Promise<AttendantBookingsResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/attendant/my-location`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in as an attendant');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden - Only attendants can access this endpoint');
      }
      if (error.response?.status === 400) {
        throw new Error('Attendant has no assigned location');
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch bookings for your location'
      );
    }
  }

  /**
   * Update booking status (for attendant workflow)
   */
  async updateBookingStatus(
    bookingId: string, 
    status: AttendantBooking['bookingStatus']
  ): Promise<AttendantBooking> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/status`,
        { status },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update booking status'
      );
    }
  }

  /**
   * Create a booking as an attendant (walk-in customers)
   */
  async createAttendantBooking(bookingData: {
    slotId: string;
    plateNumber: string;
    time: string;
    phoneNumber: string;
  }): Promise<AttendantBooking> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/attendant`,
        bookingData,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to create attendant booking'
      );
    }
  }

  /**
   * Get overstayed vehicles for attendant's location
   */
  async getOverstayedVehicles(): Promise<{
    data: any[];
    meta: { assignedLocation: AttendantLocation; count: number };
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/bookings/attendant/overstayed`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch overstayed vehicles'
      );
    }
  }

  /**
   * Process overstay payment
   */
  async processOverstayPayment(
    bookingId: string,
    paymentMethod: 'cash' | 'pos' | 'manual' | 'telebirr',
    notes?: string
  ): Promise<{
    success: boolean;
    payment: any;
    overstayDetails: any;
    receiptNumber: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/attendant/overstay-payment`,
        { bookingId, paymentMethod, notes },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to process overstay payment'
      );
    }
  }

  /**
   * Validate vehicle by plate number
   */
  async validateVehicle(plateNumber: string, slotId?: string): Promise<{
    valid: boolean;
    isOverstayed: boolean;
    booking: any;
    overstayDetails: any;
    message: string;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bookings/attendant/validate-vehicle`,
        { plateNumber, slotId },
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to validate vehicle'
      );
    }
  }

  /**
   * End parking session
   */
  async endParkingSession(bookingId: string): Promise<{
    success: boolean;
    booking: any;
    message: string;
  }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/bookings/attendant/end-session/${bookingId}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to end parking session'
      );
    }
  }

  /**
   * Get available slots for attendant's location
   */
  async getAvailableSlots(locationId: string): Promise<{
    data: any[];
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slots/location/${locationId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      // Filter only available slots
      const availableSlots = response.data.data.filter((slot: any) => 
        slot.slotStatus === 'available'
      );

      return { data: availableSlots };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch available slots'
      );
    }
  }

  /**
   * Save manual payment processed by attendant
   */
  async saveManualPayment(paymentData: {
    plateNumber: string;
    amount: number;
    paymentMethod: 'cash' | 'pos' | 'telebirr';
    notes?: string;
  }) {
    try {
      console.log('=== FRONTEND: Saving manual payment ===');
      console.log('Payment data:', paymentData);

      const response = await axios.post(
        `${API_BASE_URL}/api/payments/attendant/manual`,
        paymentData,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('=== FRONTEND: Payment saved successfully ===');
      console.log('Response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('=== FRONTEND: Payment save error ===');
      console.error('Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in as an attendant');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden - Only attendants can process payments');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid payment data');
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to save payment'
      );
    }
  }

  /**
   * Get recent payments for attendant's location
   */
  async getRecentPayments() {
    try {
      console.log('=== FRONTEND: Getting recent payments ===');

      const response = await axios.get(
        `${API_BASE_URL}/api/payments/attendant/recent`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('=== FRONTEND: Recent payments retrieved ===');
      console.log('Total payments:', response.data.data?.length || 0);

      return response.data;
    } catch (error: any) {
      console.error('=== FRONTEND: Recent payments error ===');
      console.error('Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - Please log in as an attendant');
      }
      if (error.response?.status === 403) {
        throw new Error('Forbidden - Only attendants can access payment history');
      }
      if (error.response?.status === 400) {
        throw new Error('Attendant has no assigned location');
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch recent payments'
      );
    }
  }
}

export const attendantService = new AttendantService();
export default attendantService;
