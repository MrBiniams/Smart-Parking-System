/**
 * Overstay calculation service for parking bookings
 */

export default () => ({
  /**
   * Calculate overstay details for a booking
   */
  async calculateOverstay(bookingId: string) {
    try {
      // Get booking with slot information
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          documentId: bookingId
        },
        populate: ['slot', 'slot.location', 'user']
      });

      const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];
      const booking = bookingsArray[0];
      if (!booking) {
        throw new Error('Booking not found');
      }

      const now = new Date();
      const endTime = new Date(booking.endTime);
      
      // Check if booking has ended
      if (now <= endTime) {
        return {
          isOverstayed: false,
          overstayMinutes: 0,
          overstayHours: 0,
          additionalCost: 0,
          gracePerioMinutes: 0
        };
      }

      // Calculate overstay duration
      const overstayMs = now.getTime() - endTime.getTime();
      const overstayMinutes = Math.floor(overstayMs / (1000 * 60));
      const overstayHours = Math.ceil(overstayMinutes / 60); // Round up to next hour

      // Grace period (15 minutes free)
      const gracePeriodMinutes = 15;
      const billableMinutes = Math.max(0, overstayMinutes - gracePeriodMinutes);
      const billableHours = Math.ceil(billableMinutes / 60);

      // Calculate additional cost
      // Use slot's hourly rate or default rate
      const hourlyRate = booking.slot?.price || 10; // Default 10 ETB per hour
      const additionalCost = billableHours * hourlyRate;

      return {
        isOverstayed: true,
        overstayMinutes,
        overstayHours,
        billableMinutes,
        billableHours,
        additionalCost,
        gracePeriodMinutes,
        hourlyRate,
        booking: {
          id: booking.id,
          documentId: booking.documentId,
          plateNumber: booking.plateNumber,
          endTime: booking.endTime,
          user: booking.user,
          slot: booking.slot
        }
      };
    } catch (error) {
      strapi.log.error('Error calculating overstay:', error);
      throw error;
    }
  },

  /**
   * Get all overstayed vehicles for a location
   */
  async getOverstayedVehicles(locationId: string) {
    try {
      const now = new Date();
      
      // Get all active bookings that have ended for this location
      const bookings = await strapi.entityService.findMany('api::booking.booking', {
        filters: {
          bookingStatus: 'active',
          endTime: {
            $lt: now.toISOString()
          },
          slot: {
            location: {
              documentId: locationId
            }
          }
        },
        populate: ['slot', 'slot.location', 'user'],
        sort: { endTime: 'asc' }
      });

      // Calculate overstay for each booking
      const overstayedVehicles = [];
      
      // Ensure we have a valid array to iterate over
      if (!bookings) {
        return [];
      }
      
      const bookingsArray = Array.isArray(bookings) ? bookings : (bookings ? [bookings] : []);
      
      for (const booking of bookingsArray) {
        if (!booking || !booking.documentId) {
          continue;
        }
        const overstayDetails = await this.calculateOverstay(booking.documentId);
        if (overstayDetails.isOverstayed) {
          overstayedVehicles.push({
            ...overstayDetails,
            booking: {
              id: booking.id,
              documentId: booking.documentId,
              plateNumber: booking.plateNumber,
              startTime: booking.startTime,
              endTime: booking.endTime,
              totalPrice: booking.totalPrice,
              user: booking.user,
              slot: booking.slot
            }
          });
        }
      }

      return overstayedVehicles;
    } catch (error) {
      strapi.log.error('Error getting overstayed vehicles:', error);
      throw error;
    }
  },

  /**
   * Generate receipt number for payment
   */
  generateReceiptNumber() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `RCP-${timestamp}-${random}`;
  },

  /**
   * Create overstay payment
   */
  async createOverstayPayment(bookingId: string, paymentMethod: string, attendantId: string) {
    try {
      const overstayDetails = await this.calculateOverstay(bookingId);
      
      if (!overstayDetails.isOverstayed || overstayDetails.additionalCost <= 0) {
        throw new Error('No overstay payment required');
      }

      // Generate transaction ID and receipt number
      const transactionId = `OVERSTAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const receiptNumber = this.generateReceiptNumber();

      // Create payment record
      const payment = await strapi.entityService.create('api::payment.payment', {
        data: {
          amount: overstayDetails.additionalCost,
          currency: 'ETB',
          status: paymentMethod === 'cash' || paymentMethod === 'pos' || paymentMethod === 'manual' ? 'completed' : 'pending',
          transactionId,
          paymentMethod,
          booking: bookingId,
          attendant: attendantId,
          isOverstayPayment: true,
          overstayDuration: overstayDetails.overstayMinutes,
          receiptNumber,
          customerPhone: overstayDetails.booking.user.phoneNumber,
          customerEmail: overstayDetails.booking.user.email,
          customerName: `${overstayDetails.booking.user.firstName} ${overstayDetails.booking.user.lastName}`,
          description: `Overstay payment for ${overstayDetails.overstayHours} hour(s) - Vehicle: ${overstayDetails.booking.plateNumber}`,
          metadata: {
            bookingId,
            slotId: overstayDetails.booking.slot.documentId,
            overstayMinutes: overstayDetails.overstayMinutes,
            overstayHours: overstayDetails.overstayHours,
            hourlyRate: overstayDetails.hourlyRate,
            gracePeriodMinutes: overstayDetails.gracePeriodMinutes
          },
          publishedAt: new Date()
        }
      });

      return {
        payment,
        overstayDetails,
        receiptNumber
      };
    } catch (error) {
      strapi.log.error('Error creating overstay payment:', error);
      throw error;
    }
  }
});
