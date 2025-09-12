export default {
    routes: [
      {
        method: 'GET',
        path: '/footer',
        handler: 'footer.find',
        config: {
          policies: [],
          auth: {
            enabled: false
          },
        },
      }
    ],
  }; 