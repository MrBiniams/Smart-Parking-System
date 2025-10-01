// Attendant-specific types for the Smart Parking System

export interface AttendantUser {
  id: string;
  documentId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: {
    id: string;
    name: 'Attendant';
    description: string;
  };
  location: AttendantLocation;
}

export interface AttendantLocation {
  id: string;
  documentId: string;
  name: string;
  address: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AttendantBooking {
  id: string;
  documentId: string;
  startTime: string;
  endTime: string;
  plateNumber: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  user: BookingUser;
  slot: BookingSlot;
}

export interface BookingUser {
  id: string;
  documentId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface BookingSlot {
  id: string;
  documentId: string;
  slotNumber: string;
  slotType: 'regular' | 'disabled' | 'electric' | 'compact';
  isOccupied: boolean;
  location: AttendantLocation;
}

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

export interface AttendantBookingsResponse {
  data: AttendantBooking[];
  meta: {
    assignedLocation: AttendantLocation;
    totalCount: number;
    activeBookings: number;
    completedToday: number;
  };
}

export interface CreateAttendantBookingRequest {
  slotId: string;
  plateNumber: string;
  startTime: string;
  endTime?: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
}

export interface UpdateBookingStatusRequest {
  bookingId: string;
  status: BookingStatus;
  notes?: string;
}

export interface AttendantDashboardStats {
  totalBookingsToday: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  occupancyRate: number;
}

export interface AttendantApiError {
  message: string;
  status: number;
  code?: string;
}

// UI State types
export interface AttendantBookingsState {
  bookings: AttendantBooking[];
  assignedLocation: AttendantLocation | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface AttendantFilters {
  status?: BookingStatus[];
  paymentStatus?: PaymentStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

export interface AttendantSortOptions {
  field: 'startTime' | 'endTime' | 'plateNumber' | 'totalPrice' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Component Props types
export interface AttendantBookingsListProps {
  bookings: AttendantBooking[];
  loading: boolean;
  error: string | null;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onRefresh: () => void;
}

export interface AttendantBookingCardProps {
  booking: AttendantBooking;
  onUpdateStatus: (status: BookingStatus) => Promise<void>;
  isUpdating?: boolean;
}

export interface AttendantStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export interface AttendantEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export interface AttendantErrorStateProps {
  error: string;
  onRetry: () => void;
  title?: string;
}

export interface AttendantLoadingStateProps {
  message?: string;
  showSkeleton?: boolean;
}
