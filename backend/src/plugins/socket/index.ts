import socketService from '../../services/socket';

export default {
  register({ strapi }) {
    strapi.service('api::socket.socket', socketService);
  },
  bootstrap({ strapi }) {
    strapi.service('api::socket.socket').initialize();
  },
}; 