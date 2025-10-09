import { factories } from '@strapi/strapi';
const defaultHourAddedOnUpcomingBooking = 1;
export default ({ strapi }) => ({
  async createBooking(ctx) {
    try {
      const { plateNumber, slotId, time, startDateTime } = ctx.request.body;
      const userId = ctx.state.user.documentId;

      if (!userId) {
        return {
          error: 'Unauthorized',
          status: 401
        };
      }

      // Validate required fields
      if (!plateNumber || !slotId || !time) {
        return {
          error: 'Missing required fields',
          status: 400
        };
      }

      // Validate startDateTime if provided
      let startTime = new Date();
      if (startDateTime) {
        const providedStartTime = new Date(startDateTime);
        if (providedStartTime < startTime) {
          return {
            error: 'Start time must be in the future',
            status: 400
          };
        }
        // Now start time should start from 1 hour before the provided start time
        startTime = new Date(providedStartTime.getTime() - defaultHourAddedOnUpcomingBooking * 60 * 60 * 1000);
      }

      // Calculate end time based on hours
      const endTime = new Date(startTime.getTime() + parseInt(time) * 60 * 60 * 1000);

      // Get slot details
      const slots = await strapi.entityService.findMany('api::slot.slot', {
        filters: {
          documentId: slotId,
        },
        populate: ['location'],
      });

      const slot = slots[0] || null;

      if (!slot) {
        return {
          error: 'Slot not found',
          status: 404
        };
      }

      // Check if slot is available for the requested time period
      const existingBookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          slot: slotId,
          $or: [
            {
              $and: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              $and: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
              ]
            }
          ]
        }
      });

      if (existingBookings.length > 0) {
        return {
          error: 'Slot is not available for the selected time period',
          status: 400
        };
      }

      // Calculate total price
      let totalPrice = parseInt(time) * slot.price;
      if (startDateTime) {
        totalPrice = (parseInt(time) + defaultHourAddedOnUpcomingBooking) * slot.price;
      }

      // Create booking
      const booking = await strapi.entityService.create('api::booking.booking', {
        data: {
          plateNumber,
          slot: slotId,
          startTime,
          endTime,
          duration: parseInt(time),
          totalPrice,
          bookingStatus: 'pending',
          paymentStatus: 'pending',
          user: userId
        }
      });

      return {
        success: true,
        booking
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return ctx.status(500).json({ message: 'Error creating booking' });
    }
  },

  async updateBookingStatus(ctx) {
    try {
      const { bookingId, status } = ctx.request.body;

      // Validate required fields
      if (!bookingId || !status) {
        return ctx.badRequest('Booking ID and status are required');
      }

      // Get booking with slot
      const booking = await strapi.entityService.findOne('api::booking.booking', bookingId, {
        populate: ['slot']
      });

      if (!booking) {
        return ctx.badRequest('Booking not found');
      }

      // Update booking status
      const updatedBooking = await strapi.entityService.update('api::booking.booking', booking.id, {
        data: { 
          bookingStatus: status,
          publishedAt: new Date()
        }
      });

      // If status changed to active, update slot status
      if (status === 'active') {
        await strapi.entityService.update('api::slot.slot', booking.slot.id, {
          data: {
            slotStatus: 'occupied',
            publishedAt: new Date()
          }
        });
      }

      return {
        success: true,
        booking: updatedBooking
      };
    } catch (error) {
      console.error('Booking status update error:', error);
      return ctx.badRequest(error.message);
    }
  },

  async extendBooking(ctx) {
    try {
      const { documentId } = ctx.params;
      const { extendedTime, slotId } = ctx.request.body;
      const userId = ctx.state.user.documentId;

      // Validate required fields
      if (!extendedTime || !slotId) {
        return {
          error: 'Missing extended time or slot ID',
          status: 400
        };
      }

      // Validate extended time (1-24 hours)
      const duration = parseInt(extendedTime);
      if (isNaN(duration) || duration < 1 || duration > 24) {
        return {
          error: 'Invalid duration. Must be between 1 and 24 hours',
          status: 400
        };
      }

      // Get the original booking with its extended bookings
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          documentId: documentId
        },
        populate: ['slot', 'user', 'extendedBookings']
      });

      const originalBooking = bookings[0] || null;

      if (!originalBooking) {
        return {
          error: 'Booking not found',
          status: 404
        };
      }
      
      // Check if the booking belongs to the user
      if (originalBooking.user?.documentId !== userId) {
        return {
          error: 'Unauthorized to extend this booking',
          status: 403
        };
      }

      // Check if the booking is active
      if (originalBooking.bookingStatus !== 'active') {
        return {
          error: 'Can only extend active bookings',
          status: 400
        };
      }

      // Find the last extended booking if it exists
      const lastExtendedBooking = originalBooking.extendedBookings?.length 
        ? originalBooking.extendedBookings[originalBooking.extendedBookings.length - 1]
        : null;

      // Use the last extended booking's end time if it exists, otherwise use the original booking's end time
      const startTime = lastExtendedBooking ? new Date(lastExtendedBooking.endTime) : new Date(originalBooking.endTime);
      
      // Calculate new end time
      const newEndTime = new Date(startTime);
      newEndTime.setHours(newEndTime.getHours() + duration);

      // Calculate additional price
      const additionalPrice = duration * originalBooking.slot.price;

      // Create extended booking
      const extendedBooking = await strapi.entityService.create('api::booking.booking', {
        data: {
          plateNumber: originalBooking.plateNumber,
          slot: originalBooking.slot.id,
          startTime: startTime,
          endTime: newEndTime,
          duration,
          totalPrice: additionalPrice,
          bookingStatus: 'active',
          paymentStatus: 'pending',
          user: userId,
          originalBooking: documentId
        }
      });

      return {
        success: true,
        booking: extendedBooking
      };
    } catch (error) {
      console.error('Error extending booking:', error);
      return {
        error: 'Failed to extend booking',
        status: 500
      };
    }
  },

  async createAttendantBooking(ctx) {
    try {
      const { plateNumber, slotId, time, startDateTime, phoneNumber } = ctx.request.body;
      const attendantId = ctx.state.user.documentId;

      if (!attendantId) {
        return {
          error: 'Unauthorized',
          status: 401
        };
      }

      // Validate required fields
      if (!plateNumber || !slotId || !time || !phoneNumber) {
        return {
          error: 'Missing required fields',
          status: 400
        };
      }

      // Get slot details
      const slots = await strapi.entityService.findMany('api::slot.slot', {
        filters: {
          documentId: slotId,
        },
        populate: ['location'],
      });

      const slot = slots[0] || null;

      if (!slot) {
        return {
          error: 'Slot not found',
          status: 404
        };
      }

      // Check if attendant has access to this location
      // First try to find by documentId, then by numeric ID
      let attendant = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { documentId: attendantId },
        populate: ['role'],
      });

      if (!attendant || attendant.length === 0) {
        // Try by numeric ID as fallback
        try {
          attendant = await strapi.entityService.findOne('plugin::users-permissions.user', attendantId, {
            populate: ['role'],
          });
          attendant = attendant ? [attendant] : [];
        } catch (err) {
          attendant = [];
        }
      }

      const attendantUser = attendant[0] || null;

      if (!attendantUser) {
        return {
          error: 'Attendant not found',
          status: 404
        };
      }

      if (!attendantUser.role || attendantUser.role.name !== 'Attendant') {
        return {
          error: 'Only attendants can create bookings for others',
          status: 403
        };
      }

      // Find or create user with phone number
      let user = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: {
          phoneNumber: phoneNumber
        }
      });

      if (user.length === 0) {
        // Get the Authenticated role dynamically
        const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' }
        });

        if (!authenticatedRole) {
          return {
            error: 'Authenticated role not found',
            status: 500
          };
        }

        // Create new user with phone number
        user = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username: `user_${phoneNumber}`,
            email: `${phoneNumber}@temp.com`,
            phoneNumber: phoneNumber,
            provider: 'local',
            role: authenticatedRole.id, // Use correct Authenticated role ID
            confirmed: true,
            blocked: false,
          }
        });
      } else {
        user = user[0];
      }

      // Validate startDateTime if provided
      let startTime = new Date();
      if (startDateTime) {
        const providedStartTime = new Date(startDateTime);
        if (providedStartTime < startTime) {
          return {
            error: 'Start time must be in the future',
            status: 400
          };
        }
        startTime = new Date(providedStartTime.getTime() - defaultHourAddedOnUpcomingBooking * 60 * 60 * 1000);
      }

      // Calculate end time based on hours
      const endTime = new Date(startTime.getTime() + parseInt(time) * 60 * 60 * 1000);

      // Check if slot is available for the requested time period
      const existingBookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          slot: slotId,
          $or: [
            {
              $and: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              $and: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
              ]
            }
          ]
        }
      });

      if (existingBookings.length > 0) {
        return {
          error: 'Slot is not available for the selected time period',
          status: 400
        };
      }

      // Calculate total price
      let totalPrice = parseInt(time) * slot.price;
      if (startDateTime) {
        totalPrice = (parseInt(time) + defaultHourAddedOnUpcomingBooking) * slot.price;
      }

      // Create booking
      const bookingData = {
        plateNumber,
        slot: slotId,
        startTime,
        endTime,
        duration: parseInt(time),
        totalPrice,
        bookingStatus: 'active', // Set to active immediately for attendant bookings
        paymentStatus: 'paid', // Assume payment is handled by attendant
        user: user.id,
        attendantUser: attendantId
      };

      console.log('=== SERVICE: Creating booking with data ===');
      console.log('Booking data:', bookingData);
      console.log('Slot location:', slot.location?.name);
      console.log('Attendant ID:', attendantId);
      console.log('Customer user ID:', user.id);
      console.log('=========================================');

      const booking = await strapi.entityService.create('api::booking.booking', {
        data: bookingData
      });

      // Update slot status to occupied since booking is active
      console.log('=== UPDATING SLOT STATUS ===');
      console.log('Slot ID:', slot.documentId);
      console.log('Current Status:', slot.slotStatus);
      console.log('New Status: occupied');
      
      await strapi.entityService.update('api::slot.slot', slot.documentId, {
        data: {
          slotStatus: 'occupied',
          publishedAt: new Date()
        }
      });
      
      console.log('✅ Slot status updated to occupied');
      console.log('============================');

      console.log('=== ATTENDANT BOOKING CREATED ===');
      console.log('Booking ID:', booking.documentId);
      console.log('Plate Number:', booking.plateNumber);
      console.log('Status:', booking.bookingStatus);
      console.log('Slot Status Updated:', 'occupied');
      console.log('User ID:', booking.user);
      console.log('Attendant ID:', booking.attendantUser);
      console.log('================================');

      return {
        success: true,
        booking
      };
    } catch (error) {
      console.error('Error creating attendant booking:', error);
      return {
        error: 'Failed to create booking',
        status: 500
      };
    }
  }
}); 