export default ({ strapi }) => ({
  initialize() {
    const io = strapi.server.httpServer;
    const socketIO = require('socket.io')(io, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    socketIO.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    strapi.io = socketIO;
  },
}); 