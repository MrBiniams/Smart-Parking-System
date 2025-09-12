/**
 * location controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::location.location', ({ strapi }) => ({
  async find(ctx) {
    // return meta and data
    const locations = await strapi.entityService.findMany('api::location.location', {
      populate: ['coordinates']
    });

    return { data: locations };
  },

  async findOne(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.findOne(ctx);
    return { data, meta };
  },

  async create(ctx) {
    // Add custom logic here if needed
    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    // Add custom logic here if needed
    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    // Add custom logic here if needed
    const response = await super.delete(ctx);
    return response;
  },
  async findSlots(ctx) {
    try {
      const { id } = ctx.params;
      const slots = await strapi.entityService.findMany('api::slot.slot', {
        filters: {
          location: {
            id: id
          }
        },
        populate: ['currentBooking', 'coordinates']
      });
      return { data: slots };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async findAll(ctx) {
    try {
      const locations = await strapi.entityService.findMany('api::location.location', {
        populate: ['coordinates']
      });
      return { data: locations };
    } catch (err) {
      ctx.throw(500, err);
    }
  } 
})); 