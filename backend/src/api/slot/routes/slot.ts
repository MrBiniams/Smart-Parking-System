export default {
  routes: [
    {
      method: 'GET',
      path: '/slots',
      handler: 'slot.find',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/slots/:id',
      handler: 'slot.findOne',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/slots/location/:locationId',
      handler: 'slot.findByLocation',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/slots/available',
      handler: 'slot.findAvailable',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'POST',
      path: '/slots',
      handler: 'slot.create',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/slots/:id',
      handler: 'slot.update',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/slots/:id/status',
      handler: 'slot.updateStatus',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'DELETE',
      path: '/slots/:id',
      handler: 'slot.delete',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
  ],
}; 