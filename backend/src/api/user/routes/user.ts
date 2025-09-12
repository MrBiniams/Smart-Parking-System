export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'user.login',
      config: {
        auth: false,
        policies: [],
        description: 'Login user',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'login'
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/signup',
      handler: 'user.register',
      config: {
        auth: false,
        policies: [],
        description: 'Register new user',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'register'
        }
      }
    },
    {
      method: 'GET',
      path: '/auth/users/me',
      handler: 'user.getCurrentUser',
      config: {
        auth: {
          strategy: 'jwt',
          scope: ['users-permissions']
        },
        policies: [],
        description: 'Get current user',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'getCurrentUser'
        }
      }
    },
    {
      method: 'PUT',
      path: '/auth/users/me',
      handler: 'user.updateProfile',
      config: {
        auth: {
          scope: ['users-permissions']
        },
        policies: [],
        description: 'Update current user profile',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'updateProfile'
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/users/check-permission',
      handler: 'user.checkPermission',
      config: {
        auth: {
          scope: ['users-permissions']
        },
        policies: [],
        description: 'Check if user has specific permission',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'checkPermission'
        }
      }
    },
    {
      method: 'POST',
      path: '/auth/users/check-permissions',
      handler: 'user.checkPermissions',
      config: {
        auth: {
          scope: ['users-permissions']
        },
        policies: [],
        description: 'Check if user has all specified permissions',
        tag: {
          plugin: 'users-permissions',
          name: 'User',
          actionType: 'checkPermissions'
        }
      }
    },
    {
      method: 'GET',
      path: '/users',
      handler: 'user.find',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/users/:id',
      handler: 'user.findOne',
      config: {
        policies: []
      }
    },
    {
      method: 'POST',
      path: '/users',
      handler: 'user.create',
      config: {
        policies: []
      }
    },
    {
      method: 'PUT',
      path: '/users/:id',
      handler: 'user.update',
      config: {
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/users/:id',
      handler: 'user.delete',
      config: {
        policies: []
      }
    }
  ]
}; 