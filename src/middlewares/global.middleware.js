const { getSettings } = require('../services/setting.service');

const globalMiddleware = async (req, res, next) => {
  const namespace = req.headers?.['x-namespace'] || 'main';
  req.namespace = namespace;
  req.settings = {};
  try {
    req.settings = await getSettings(namespace);
  } catch (error) {
    console.log(error);
  }
  req.referer = req.headers.referrer || req.headers.referer;
  // console.log(
  //   `url: ${req.protocol}://${req.get('host')}${
  //     req.originalUrl
  //   } - body: ${JSON.stringify(req?.body)}`,
  // );
  let send = res.send;
  res.send = (response) => {
    res.send = send;
    return res.send(response);
  };
  next();
};

module.exports = globalMiddleware;
