import { Server } from 'socket.io';

let io: Server;

export default ({ strapi }: { strapi: any }) => ({
  initialize() {
    // Initialize Socket.IO server
    io = new Server(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('New client connected');

      // Join room for specific parking location
      socket.on('join-location', (locationId: string) => {
        socket.join(`location-${locationId}`);
      });

      // Leave room
      socket.on('leave-location', (locationId: string) => {
        socket.leave(`location-${locationId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    strapi.io = io;
  },

  // Emit events to all clients in a location room
  emit(event: string, locationId: string, data: any) {
    if (io) {
      io.to(`location-${locationId}`).emit(event, data);
    }
  },
}); 