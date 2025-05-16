const checkMaintenanceMiddleware = (req, res, next) => {
  const { settings } = req;
  req.isMaintainance = settings.isMaintenance;
  next();
};

module.exports = checkMaintenanceMiddleware;
