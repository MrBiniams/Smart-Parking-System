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
    }
  ]
}; 