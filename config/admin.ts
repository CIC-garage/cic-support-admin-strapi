export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'tobemodified'),
    sessions: {
      maxRefreshTokenLifespan: 30 * 24 * 60 * 60 * 1000,
      maxSessionLifespan: 7 * 24 * 60 * 60 * 1000,
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'tobemodified'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'tobemodified'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
