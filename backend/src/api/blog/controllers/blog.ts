/**
 * blog controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({
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
    // Create the blog
    const response = await super.create(ctx);
    
    // Emit socket event
    strapi.service('api::socket.socket').emit(
      'blog-created',
      response.data.attributes.locationId,
      response.data
    );

    return response;
  },

  async update(ctx) {
    // Update the blog
    const response = await super.update(ctx);
    
    // Emit socket event
    strapi.service('api::socket.socket').emit(
      'blog-updated',
      response.data.attributes.locationId,
      response.data
    );

    return response;
  },

  async delete(ctx) {
    // Get the blog before deletion
    const blog = await strapi.entityService.findOne(
      'api::blog.blog',
      ctx.params.id,
      { populate: ['location'] }
    );

    // Delete the blog
    const response = await super.delete(ctx);
    
    // Emit socket event
    if (blog?.location?.id) {
      strapi.service('api::socket.socket').emit(
        'blog-deleted',
        blog.location.id,
        { id: ctx.params.id }
      );
    }

    return response;
  },
})); 