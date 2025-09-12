export default {
  routes: [
    {
      method: 'GET',
      path: '/blog',
      handler: 'blog.find',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/blog/:id',
      handler: 'blog.findOne',
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
      path: '/blog',
      handler: 'blog.create',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/blog/:id',
      handler: 'blog.update',
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
      path: '/blog/:id',
      handler: 'blog.delete',
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