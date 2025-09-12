export default {
  routes: [
    {
      method: 'GET',
      path: '/socket',
      handler: 'socket.index',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
}; 