/**
 * slot controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::slot.slot', ({ strapi }) => ({
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

  async findByLocation(ctx) {
    try {
      const { locationId } = ctx.params;
      const slots = await strapi.entityService.findMany('api::slot.slot', {
        filters: {
          location: {
            documentId: locationId
          }
        },
        populate: ['currentBooking', 'coordinates']
      });
      return { data: slots };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findAvailable(ctx) {
    try {
      const slots = await strapi.entityService.findMany('api::slot.slot', {
        filters: {
          slotStatus: 'available'
        },
        populate: ['location', 'coordinates']
      });
      return { data: slots };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      const slot = await strapi.entityService.update('api::slot.slot', id, {
        data: {
          slotStatus: status
        } as any,
        populate: ['location', 'currentBooking', 'coordinates']
      });

      // Emit socket event for real-time updates
      strapi.service('api::socket.socket').emit(
        'slot-status-updated',
        slot.location.documentId,
        slot
      );

      return { data: slot };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
})); 