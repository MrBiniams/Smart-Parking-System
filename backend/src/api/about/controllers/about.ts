/**
 * about controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::about.about', ({ strapi }) => ({
  async find(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  }
})); 