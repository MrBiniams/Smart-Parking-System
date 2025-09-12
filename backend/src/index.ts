// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Initialize socket service
    strapi.service('api::socket.socket').initialize();

    // Run seed migration
    try {
      const seed = require('../database/migrations/seed').default;
      await seed(strapi);
    } catch (error) {
      console.error('Error running seed migration:', error);
    }
  },
};
