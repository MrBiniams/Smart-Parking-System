export default {
  routes: [
    {
      method: 'GET',
      path: '/locations',
      handler: 'location.find',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/locations/:id',
      handler: 'location.findOne',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/locations/:id/slots',
      handler: 'location.findSlots',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'POST',
      path: '/locations',
      handler: 'location.create',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/locations/:id',
      handler: 'location.update',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'DELETE',
      path: '/locations/:id',
      handler: 'location.delete',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
  ],
}; 