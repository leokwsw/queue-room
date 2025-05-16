const checkInternalUserMiddleware = (req, res, next) => {
  let whiteListIps;
  const { clientIp, settings } = req;
  console.log(`client Ip: ${clientIp}`);
  const trustedIp = settings?.trustedIp;
  if (Array.isArray(trustedIp)) {
    whiteListIps = trustedIp;
  } else {
    whiteListIps = trustedIp ? trustedIp.replace(' ', '').split(',') : [];
  }
  req.isInternalUser = whiteListIps.includes(clientIp);
  next();
};

module.exports = checkInternalUserMiddleware;
