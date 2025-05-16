const dotenv = require('dotenv');
dotenv.config();

const jwtConfig = require('./jwt.config');
const redisConfig = require('./redis.config');
const basicAuthConfig = require('./basic-auth.config');

module.exports = {
  jwt: jwtConfig,
  redis: redisConfig,
  basicAuth: basicAuthConfig,
  waitingPageUrl: process.env.WAITING_PAGE_URL,
  maintenancePageUrl: process.env.MAINTENANCE_PAGE_URL,
  nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'lambda',
  webUrl: process.env.WEB_URL || 'https://www.google.com',
};
