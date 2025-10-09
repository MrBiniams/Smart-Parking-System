/**
 * booking controller
 */

export default {
  async create(ctx) {
    try {
      const result = await strapi.service('api::booking.booking').createBooking(ctx);
      return result;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async extend(ctx) {
    try {
      const result = await strapi.service('api::booking.booking').extendBooking(ctx);
      return result;
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      const booking = await strapi.entityService.update('api::booking.booking', id, {
        data: {
          bookingStatus: status
        } as any,
        populate: ['user', 'slot', 'location']
      });

      // Emit socket event for real-time updates
      strapi.service('api::socket.socket').emit(
        'booking-status-updated',
        booking.location.documentId,
        booking
      );

      return { data: booking };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async find(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  async findOne(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },

  async update(ctx) {
    // Update the booking
    const response = await super.update(ctx);
    
    // Emit socket event
    strapi.service('api::socket.socket').emit(
      'booking-updated',
      response.data.attributes.locationId,
      response.data
    );

    return response;
  },

  async delete(ctx) {
    // Get the booking before deletion
    const booking = await strapi.entityService.findOne(
      'api::booking.booking',
      ctx.params.documentId,
      { populate: ['location'] }
    );

    // Delete the booking
    const response = await super.delete(ctx);
    
    // Emit socket event
    if (booking?.location?.documentId) {
      strapi.service('api::socket.socket').emit(
        'booking-deleted',
        booking.location.documentId,
        response.data
      );
    }

    return response;
  },

  async findMyBookings(ctx) {
    try {
      console.log('🔍 findMyBookings called');
      console.log('🔍 ctx.state:', ctx.state);
      console.log('🔍 ctx.state.user:', ctx.state.user);
      
      const userId = ctx.state.user?.documentId;
      if (!userId) {
        console.log('❌ No userId found');
        return ctx.unauthorized('User not authenticated');
      }
      
      console.log('✅ userId:', userId);

      // First get all original bookings that are active
      const originalBookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          user: {
            documentId: userId
          },
          bookingStatus: {
            $in: ['active']
          },
          endTime: {
            $gt: new Date()
          },
          originalBooking: {
            $null: true
          }
        },
        populate: ['slot.location', 'extendedBookings']
      });

      // Process each original booking to combine with its extensions
      const processedBookings = originalBookings.map((booking) => {
        const extendedBookings = booking.extendedBookings;

        // Calculate total price
        const totalPrice = extendedBookings.reduce((sum, ext) => sum + (ext.totalPrice || 0), booking.totalPrice || 0);

        // Find the latest end time from all extended bookings
        const latestEndTime = extendedBookings.length > 0 
          ? new Date(Math.max(...extendedBookings.map(ext => new Date(ext.endTime).getTime())))
          : booking.endTime;

        // Return the combined booking data
        const bookingData = {
          ...booking,
          totalPrice,
          endTime: latestEndTime,
          bookingStatus: booking.bookingStatus === 'active' ? (new Date(booking.startTime) > new Date() ? 'upcoming' : 'active') : booking.bookingStatus,
          extendedBookings: extendedBookings.map(ext => ({
            id: ext.id,
            startTime: ext.startTime,
            endTime: ext.endTime,
            totalPrice: ext.totalPrice,
            bookingStatus: ext.bookingStatus,
            paymentStatus: ext.paymentStatus
          }))
        };

        return bookingData;
      });

      return { data: processedBookings };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findByUser(ctx) {
    try {
      const { userId } = ctx.params;
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          user: {
            id: userId
          }
        },
        populate: ['slot.location']
      });
      return { data: bookings };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findBySlot(ctx) {
    try {
      const { slotId } = ctx.params;
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          slot: {
            id: slotId
          }
        },
        populate: ['user', 'location']
      });
      return { data: bookings };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findAttendantBookings(ctx) {
    try {
      const attendantId = ctx.state.user?.id; // Use numeric ID instead of documentId
      const attendantDocumentId = ctx.state.user?.documentId;

      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details with their assigned location - try numeric ID first
      let attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
        populate: ['role', 'location'],
      });
      
      // If not found with numeric ID, try with documentId
      if (!attendant && attendantDocumentId) {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role', 'location'],
        });
      }

      if (!attendant) {
        return ctx.unauthorized('Attendant not found');
      }

      if (attendant.role.name !== 'Attendant') {
        return ctx.forbidden('Only attendants can access this endpoint');
      }

      // Check if attendant has an assigned location
      if (!attendant.location) {
        return ctx.badRequest('Attendant has no assigned location');
      }

      // Get bookings for the attendant's assigned location only
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          slot: {
            location: {
              documentId: attendant.location.documentId
            }
          }
        },
        populate: ['user', 'slot', 'slot.location'],
        sort: { startTime: 'desc' }
      });

      return { 
        data: bookings,
        meta: {
          assignedLocation: {
            id: attendant.location.id,
            documentId: attendant.location.documentId,
            name: attendant.location.name
          }
        }
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async createAttendantBooking(ctx) {
    try {
      
      const result = await strapi.service('api::booking.booking').createAttendantBooking(ctx);
      
      
      return result;
    } catch (err) {
      console.error('Booking creation error:', err);
      ctx.throw(500, err);
    }
  },

  async getOverstayedVehicles(ctx) {
    try {
      const attendantId = ctx.state.user?.id; // Use numeric ID like the other endpoint
      const attendantDocumentId = ctx.state.user?.documentId;

      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details with their assigned location - try numeric ID first
      let attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
        populate: ['role', 'location'],
      });
      
      // If not found with numeric ID, try with documentId
      if (!attendant && attendantDocumentId) {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role', 'location'],
        });
      }

      if (!attendant || attendant.role.name !== 'Attendant' || !attendant.location) {
        return ctx.forbidden('Only attendants with assigned locations can access this endpoint');
      }

      // Get overstayed vehicles for attendant's location
      const overstayedVehicles = await strapi.service('api::booking.overstay').getOverstayedVehicles(attendant.location.documentId);

      return { 
        data: overstayedVehicles,
        meta: {
          assignedLocation: attendant.location,
          count: overstayedVehicles.length
        }
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async processOverstayPayment(ctx) {
    try {
      const attendantId = ctx.state.user?.id; // Use numeric ID like other working endpoints
      const attendantDocumentId = ctx.state.user?.documentId;
      const { bookingId, paymentMethod, notes } = ctx.request.body;


      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Validate attendant using numeric ID first, fallback to documentId
      let attendant = null;
      try {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
          populate: ['role'],
        });
      } catch (err) {
        console.log('Fallback to documentId lookup');
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role'],
        });
      }

      if (!attendant || attendant.role.name !== 'Attendant') {
        return ctx.forbidden('Only attendants can process overstay payments');
      }

      // Validate payment method
      const validMethods = ['cash', 'pos', 'manual', 'telebirr'];
      if (!validMethods.includes(paymentMethod)) {
        return ctx.badRequest('Invalid payment method');
      }

      // Create overstay payment
      const result = await strapi.service('api::booking.overstay').createOverstayPayment(
        bookingId, 
        paymentMethod, 
        attendantId
      );

      // If manual payment (cash/pos), mark booking as completed
      if (['cash', 'pos', 'manual'].includes(paymentMethod)) {
        await strapi.entityService.update('api::booking.booking', result.overstayDetails.booking.id, {
          data: {
            paymentStatus: 'paid',
            publishedAt: new Date()
          } as any
        });
      }

      return {
        success: true,
        payment: result.payment,
        overstayDetails: result.overstayDetails,
        receiptNumber: result.receiptNumber
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async validateVehicle(ctx) {
    try {
      const attendantId = ctx.state.user?.id; // Use numeric ID like other working endpoints
      const attendantDocumentId = ctx.state.user?.documentId;
      const { plateNumber, slotId } = ctx.request.body;


      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details using numeric ID first, fallback to documentId
      let attendant = null;
      try {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
          populate: ['role', 'location'],
        });
      } catch (err) {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role', 'location'],
        });
      }

      if (!attendant || attendant.role.name !== 'Attendant' || !attendant.location) {
        return ctx.forbidden('Only attendants with assigned locations can validate vehicles');
      }
      // Find active booking for this plate number and location (case insensitive)
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          $or: [
            { plateNumber: plateNumber.toUpperCase() },
            { plateNumber: plateNumber.toLowerCase() },
            { plateNumber: plateNumber } // Original case
          ],
          bookingStatus: 'active',
          slot: {
            location: {
              documentId: attendant.location.documentId
            }
          }
        },
        populate: ['user', 'slot', 'slot.location'],
        sort: { startTime: 'desc' }
      });


      if (bookings.length === 0) {
        return {
          valid: false,
          isOverstayed: false,
          booking: null,
          overstayDetails: null,
          message: 'No active booking found for this vehicle'
        };
      }

      const booking = bookings[0];
      const now = new Date();
      const endTime = new Date(booking.endTime);
      const startTime = new Date(booking.startTime);

      // Check if booking is valid
      const isActive = now >= startTime && now <= endTime;
      const isOverstayed = now > endTime;

      // Calculate overstay if applicable
      let overstayDetails = null;
      if (isOverstayed) {
        overstayDetails = await strapi.service('api::booking.overstay').calculateOverstay(booking.documentId);
      }

      return {
        valid: isActive,
        isOverstayed,
        booking: {
          id: booking.id,
          documentId: booking.documentId,
          plateNumber: booking.plateNumber,
          startTime: booking.startTime,
          endTime: booking.endTime,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          totalPrice: booking.totalPrice,
          user: booking.user,
          slot: booking.slot
        },
        overstayDetails,
        message: isActive 
          ? 'Vehicle has valid parking' 
          : isOverstayed 
            ? 'Vehicle has overstayed - payment required'
            : 'Booking not yet active'
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async endParkingSession(ctx) {
    try {
      const attendantId = ctx.state.user?.id; // Use numeric ID like other working endpoints
      const attendantDocumentId = ctx.state.user?.documentId;
      const { bookingId } = ctx.params;


      if (!attendantId) {
        return ctx.unauthorized('Unauthorized');
      }

      // Get attendant details using numeric ID first, fallback to documentId
      let attendant = null;
      try {
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
          populate: ['role'],
        });
      } catch (err) {
        console.log('Fallback to documentId lookup');
        attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantDocumentId, {
          populate: ['role'],
        });
      }

      if (!attendant || attendant.role.name !== 'Attendant') {
        return ctx.forbidden('Only attendants can end parking sessions');
      }

      // Get booking
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          documentId: bookingId
        },
        populate: ['slot']
      });

      const booking = bookings[0];
      if (!booking) {
        return ctx.badRequest('Booking not found');
      }

      if (booking.bookingStatus === 'completed') {
        return ctx.badRequest('Parking session already ended');
      }

      // Update booking status
      const updatedBooking = await strapi.entityService.update('api::booking.booking', booking.id, {
        data: {
          bookingStatus: 'completed',
          endTime: new Date().toISOString(), // Update actual end time
          publishedAt: new Date()
        } as any,
        populate: ['slot']
      });

      // Update slot status to available
      if (booking.slot) {
        await strapi.entityService.update('api::slot.slot', booking.slot.id, {
          data: {
            slotStatus: 'available',
            publishedAt: new Date()
          } as any
        });
      }

      return {
        success: true,
        booking: updatedBooking,
        message: 'Parking session ended successfully'
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  // Debug endpoint to check all users and bookings
  async debugUsers(ctx) {
    try {
      
      // Get all users with error handling
      let users: any[] = [];
      try {
        const usersResult = await strapi.entityService.findMany('plugin::users-permissions.user', {
          populate: ['role'],
          limit: 20
        });
        users = Array.isArray(usersResult) ? usersResult : [usersResult];
      } catch (userErr) {
        console.error('Error fetching users:', userErr);
      }

      // Get all bookings with error handling
      let bookings: any[] = [];
      try {
        const bookingsResult = await strapi.entityService.findMany('api::booking.booking', {
          populate: ['user', 'slot'],
          sort: { createdAt: 'desc' },
          limit: 10
        });
        bookings = Array.isArray(bookingsResult) ? bookingsResult : [bookingsResult];
      } catch (bookingErr) {
        console.error('Error fetching bookings:', bookingErr);
      }

      // Fix Oro4939 booking - should belong to Kalkidan (ID: 4), not Verona (ID: 1)
      const bookingToFix = bookings.find(b => b.id === 4939);
      if (bookingToFix) {
        bookingToFix.userId = 4;
      }

      return {
        users: users.map(u => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          phone: u.phoneNumber,
          role: u.role?.name
        })),
        bookings: bookings.map(b => ({
          plateNumber: b.plateNumber,
          userName: `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim(),
          userId: b.user?.id
        }))
      };  
    } catch (err) {
      console.error('Debug endpoint error:', err);
      ctx.body = {
        success: false,
        stack: err.stack
      };
    }
  }
}; 