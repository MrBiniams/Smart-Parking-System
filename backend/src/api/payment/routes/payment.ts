export default {
  routes: [
    {
      method: 'POST',
      path: '/payment/initiate',
      handler: 'payment.initiate',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      }
    },
    {
      method: 'GET',
      path: '/payment/verify/:paymentId',
      handler: 'payment.verify',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      }
    },
    {
      method: 'POST',
      path: '/payments/attendant/manual',
      handler: 'payment.createAttendantPayment',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    },
    {
      method: 'GET',
      path: '/payments/attendant/recent',
      handler: 'payment.getAttendantRecentPayments',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    }
  ]
};