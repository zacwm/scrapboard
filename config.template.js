module.exports = {
  port: process.env.PORT || 3481,

  // Cookie session for login
  cookieSession: {
    name: 'session',
    keys: ['key1', 'key2'],
  },

  // Array of Discord user ID's of admins
  admins: [],

  // Obtained from Discord developer portal.
  discord: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },

  // Notifies the Discord webhook when a submission is created.
  webhook: {
    id: "",
    token: "",
  },

  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/scrapboard',
};
