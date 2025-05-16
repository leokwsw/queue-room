const jwt = require('jsonwebtoken');
const config = require('../configs');

const sign = (payload, extendOnlineTime) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: extendOnlineTime ?? config.jwt.expiresIn,
  });
};

const verify = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { sign, verify };
