const Redis = require('ioredis');
const config = require('../configs');

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  username: config.redis.username,
  password: config.redis.password,
  db: config.redis.db,
});

module.exports = redis;
