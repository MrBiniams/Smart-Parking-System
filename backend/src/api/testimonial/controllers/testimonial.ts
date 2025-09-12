/**
 * testimonial controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::testimonial.testimonial', ({ strapi }) => ({
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

  async create(ctx) {
    // Create the testimonial
    const response = await super.create(ctx);
    
    // Emit socket event
    strapi.service('api::socket.socket').emit(
      'testimonial-created',
      response.data.attributes.locationId,
      response.data
    );

    return response;
  },

  async update(ctx) {
    // Update the testimonial
    const response = await super.update(ctx);
    
    // Emit socket event
    strapi.service('api::socket.socket').emit(
      'testimonial-updated',
      response.data.attributes.locationId,
      response.data
    );

    return response;
  },

  async delete(ctx) {
    // Get the testimonial before deletion
    const testimonial = await strapi.entityService.findOne(
      'api::testimonial.testimonial',
      ctx.params.id,
      { populate: ['location'] }
    );

    // Delete the testimonial
    const response = await super.delete(ctx);
    
    // Emit socket event
    if (testimonial?.location?.id) {
      strapi.service('api::socket.socket').emit(
        'testimonial-deleted',
        testimonial.location.id,
        { id: ctx.params.id }
      );
    }

    return response;
  },
})); 