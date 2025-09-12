export default {
  routes: [
    {
      method: 'GET',
      path: '/testimonial',
      handler: 'testimonial.find',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/testimonial/:id',
      handler: 'testimonial.findOne',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
        params: {
          id: {
            type: 'uuid',
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/testimonial',
      handler: 'testimonial.create',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/testimonial/:id',
      handler: 'testimonial.update',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
        params: {
          id: {
            type: 'uuid',
          },
        },
      },
    },
    {
      method: 'DELETE',
      path: '/testimonial/:id',
      handler: 'testimonial.delete',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
        params: {
          id: {
            type: 'uuid',
          },
        },
      },
    },
  ],
}; 