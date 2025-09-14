import api from '@/services/api';

export interface Button {
  text: string;
  href: string;
  primary: boolean;
}

export interface HeroSection {
  title: string;
  description: string;
  buttons: Array<{
    text: string;
    href: string;
    primary: boolean;
  }>;
  image: {
    url: string;
    alternativeText: string;
  };
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface AboutSection {
  title: string;
  description: string;
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}
export interface Service {
  icon: string;
  title: string;
  description: string;
  features?: string[];
}

export interface ServicesSection {
  title: string;
  services: Service[];
}
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface BlogSection {
  title: string;
  posts: Array<{
    title: string;
    description: string;
    content: string;
    slug: string;
    createdAt: string;
    image: {
      url: string;
      alternativeText: string;
    };
    author: {
      username: string;
    };
  }>;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface TestimonialsSection {
  title: string;
  items: Array<{
    name: string;
    role: string;
    content: string;
    avatar: {
      url: string;
      alternativeText: string;
    };
  }>;
}

export interface QuickLink {
  text: string;
  href: string;
}

export interface Contact {
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface FooterSection {
  description: string;
  quickLinks: Array<{
    text: string;
    href: string;
  }>;
  contact: {
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  social: Array<{
    name: string;
    href: string;
    icon: string;
  }>;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  documentId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  slots?: Slot[];
  distance?: number;
}

export interface Slot {
  id: string;
  documentId: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  slotStatus: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'standard' | 'premium' | 'disabled' | 'electric';
  price?: number;
  location: {
    id: string;
    documentId: string;
    name: string;
    address: string;
  };
}

export interface BookingSection {
  title: string;
  subtitle: string;
}

export interface BookingData {
  slotId: string;
  locationId: string;
  startTime: string;
  endTime: string;
  userId: string;
}

const createBooking = async (bookingData: BookingData) => {
  try {
    const response = await api.post('/api/bookings', { data: bookingData });
    
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export interface Booking {
  id: string;
  documentId: string;
  plateNumber: string;
  startTime: string;
  endTime: string;
  bookingStatus: string;
  paymentStatus: string;
  totalPrice: number;
  user?: {
    id: string;
    username: string;
    phoneNumber: string;
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
}

export interface CreateBookingData {
  plateNumber: string;
  slotId: string;
  time: string;
  startDateTime?: string;
}

export interface BookingResponse {
  data: Booking;
  meta: {
    message: string;
  };
} 