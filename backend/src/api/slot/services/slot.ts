import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::slot.slot', ({ strapi }) => ({
  async updateStatus(id: number, slotStatus: 'available' | 'occupied' | 'reserved' | 'maintenance') {
    // Update the slot status
    const updatedSlot = await strapi.entityService.update('api::slot.slot', id, {
      data: { 
        slotStatus: slotStatus,
        publishedAt: new Date()
      } as any,
      populate: ['location'],
    });

    // Update location's available slots count
    if (updatedSlot.location) {
      const location = await strapi.entityService.findOne(
        'api::location.location',
        updatedSlot.location.id,
        { populate: ['slots'] }
      );

      const availableSlots = location.slots.filter(
        (slot) => slot.slotStatus === 'available'
      ).length;

      await strapi.entityService.update(
        'api::location.location',
        location.id,
        {
          data: { 
            availableSlots: availableSlots 
          } as any,
        }
      );

      // Emit socket event for slot status change
      strapi.service('api::socket.socket').emit(
        'slot-updated',
        location.id,
        {
          slotId: id,
          slotStatus,
          availableSlots,
        }
      );
    }

    return updatedSlot;
  },
})); 