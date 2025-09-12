/**
 * hero controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::hero.hero', ({ strapi }) => ({
  async find(ctx) {
    // Add custom logic here if needed
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  }
})); 