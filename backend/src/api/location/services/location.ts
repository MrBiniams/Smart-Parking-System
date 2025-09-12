import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::location.location', ({ strapi }) => ({
  async findNearby(lat: number, lng: number, radius: number = 5) {
    // Convert radius from kilometers to degrees (approximate)
    const latRadius = radius / 111.32; // 1 degree = 111.32 km
    const lngRadius = radius / (111.32 * Math.cos(lat * Math.PI / 180));

    const locations = await strapi.entityService.findMany('api::location.location', {
      filters: {
        $and: [
          {
            'coordinates.lat': {
              $gte: lat - latRadius,
              $lte: lat + latRadius,
            },
          },
          {
            'coordinates.lng': {
              $gte: lng - lngRadius,
              $lte: lng + lngRadius,
            },
          },
        ],
      },
      populate: ['slots', 'images'],
    });

    // Calculate actual distance and sort by proximity
    return locations
      .map((location) => ({
        ...location,
        distance: this.calculateDistance(
          lat,
          lng,
          location.coordinates.lat,
          location.coordinates.lng
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  },

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
})); 