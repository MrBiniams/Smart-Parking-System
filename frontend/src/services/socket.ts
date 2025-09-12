import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:1337';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to slot status updates
  onSlotStatusUpdate(callback: (data: { slotId: number; status: string }) => void) {
    const socket = this.connect();
    socket.on('slot:statusUpdate', callback);
    return () => socket.off('slot:statusUpdate', callback);
  }

  // Subscribe to location updates (available slots, etc.)
  onLocationUpdate(callback: (data: { locationId: number; availableSlots: number }) => void) {
    const socket = this.connect();
    socket.on('location:update', callback);
    return () => socket.off('location:update', callback);
  }

  // Subscribe to booking updates
  onBookingUpdate(callback: (data: { bookingId: number; status: string }) => void) {
    const socket = this.connect();
    socket.on('booking:update', callback);
    return () => socket.off('booking:update', callback);
  }

  // Subscribe to new bookings
  onNewBooking(callback: (data: { bookingId: number }) => void) {
    const socket = this.connect();
    socket.on('booking:create', callback);
    return () => socket.off('booking:create', callback);
  }
}

export const socketService = new SocketService();
export default socketService; 