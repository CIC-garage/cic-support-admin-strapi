// config/admin.js
import crypto from 'crypto';

module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    // generate a 16-byte random salt
    salt: env('API_TOKEN_SALT', crypto.randomBytes(16).toString('base64')),
  },
});
