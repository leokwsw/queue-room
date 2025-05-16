const checkMaintenanceMiddleware = require('./check-maintainace.middleware');
const checkInternalUserMiddleware = require('./check-internal-user.middleware');
const globalMiddleware = require('./global.middleware');

module.exports = {
  checkMaintenanceMiddleware,
  checkInternalUserMiddleware,
  globalMiddleware,
};
