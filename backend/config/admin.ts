export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'your-secret-key'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'your-salt-key'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'your-transfer-salt-key'),
    },
  },
}); 