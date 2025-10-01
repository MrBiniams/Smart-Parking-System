export default {
  routes: [
    {
      method: 'GET',
      path: '/bookings',
      handler: 'booking.find',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/bookings/:id',
      handler: 'booking.findOne',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/bookings/mybookings/me',
      handler: 'booking.findMyBookings',
      config: {
        policies: [],
        auth: {
          strategy: 'api-token'
        }
      }
    },
    {
      method: 'GET',
      path: '/bookings/user/:userId',
      handler: 'booking.findByUser',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/bookings/slot/:slotId',
      handler: 'booking.findBySlot',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'POST',
      path: '/bookings',
      handler: 'booking.create',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/bookings/:id',
      handler: 'booking.update',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'PUT',
      path: '/bookings/:id/status',
      handler: 'booking.updateStatus',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'DELETE',
      path: '/bookings/:id',
      handler: 'booking.delete',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'POST',
      path: '/bookings/:documentId/extend',
      handler: 'booking.extend',
      config: {
        policies: [],
        auth: {
          enabled: true
        },
      },
    },
    {
      method: 'GET',
      path: '/bookings/attendant/my-location',
      handler: 'booking.findAttendantBookings',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    },
    {
      method: 'POST',
      path: '/bookings/attendant',
      handler: 'booking.createAttendantBooking',
      config: {
        policies: ['api::global.is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/bookings/attendant/overstayed',
      handler: 'booking.getOverstayedVehicles',
      config: {
        auth: {
          strategy: 'jwt',
        },
      },
    },
    {
      method: 'POST',
      path: '/bookings/attendant/overstay-payment',
      handler: 'booking.processOverstayPayment',
      config: {
        policies: ['api::global.is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/bookings/attendant/validate-vehicle',
      handler: 'booking.validateVehicle',
      config: {
        policies: ['api::global.is-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/bookings/attendant/end-session/:bookingId',
      handler: 'booking.endParkingSession',
      config: {
        policies: ['api::global.is-authenticated'],
      },
    },
  ],
}; 