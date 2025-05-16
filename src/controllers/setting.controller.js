const settingService = require('../services/setting.service');
const { basicAuth } = require('../configs');

const getSettings = async (req, res) => {
  const response = await settingService.getSettings(req.params.namespace);
  res.send(response);
};

const syncSettings = async (req, res) => {
  await settingService.syncSettings();
  res.send();
};

const updateSettings = async (req, res) => {
  try {
    const authorization = req.headers.authorization.split(' ')[1];
    const usernamePassword = Buffer.from(authorization, 'base64').toString();
    if (usernamePassword !== `${basicAuth.username}:${basicAuth.password}`) {
      throw new Error('Unauthorized');
    }
  } catch (error) {
    console.log(error);
    return res.send(401, 'Unauthorized');
  }
  const response = await settingService.updateSettings(
    req.body,
    req.params.namespace,
  );
  res.send(response);
};

const checkMaintenance = async (req, res) => {
  const { settings } = req;
  res.send({
    maintenance: settingService.isMaintenance({ settings }),
    reopenTime: settings.maintenanceResumeTime,
  });
};

const getWebUrl = async (req, res) => {
  res.send({
    webUrl: settingService.getWebUrl(),
  });
};

module.exports = {
  syncSettings,
  updateSettings,
  getSettings,
  checkMaintenance,
  getWebUrl,
};
