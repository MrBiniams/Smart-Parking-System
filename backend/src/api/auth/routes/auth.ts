export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/send-otp',
      handler: 'auth.initializeOtp',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/verify-otp',
      handler: 'auth.verifyOtp',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/register',
      handler: 'auth.signup',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/verify-token',
      handler: 'auth.verifyToken',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/attendant-login',
      handler: 'auth.attendantLogin',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth/complete-profile',
      handler: 'auth.completeProfile',
      config: {
        auth: {
          strategy: 'jwt',
          scope: ['users-permissions']
        },
      },
    },
    {
      method: 'PUT',
      path: '/auth/edit-profile',
      handler: 'auth.editProfile',
      config: {
        auth: {
          strategy: 'jwt',
          scope: ['users-permissions']
        },
      },
    },
    {
      method: 'POST',
      path: '/auth/attendant/change-password',
      handler: 'auth.changeAttendantPassword',
      config: {
        auth: {
          strategy: 'jwt',
          scope: ['users-permissions']
        },
      },
    },
  ],
};