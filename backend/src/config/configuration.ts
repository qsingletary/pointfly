export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  adminApiKey: process.env.ADMIN_API_KEY,
  oddsApi: {
    key: process.env.ODDS_API_KEY,
    baseUrl: 'https://api.the-odds-api.com/v4',
    sport: process.env.ODDS_API_SPORT || 'basketball_nba',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS,
});
