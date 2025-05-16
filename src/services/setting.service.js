const dotenv = require('dotenv');
dotenv.config();
const redis = require('../common/redis');
const configs = require('../configs');

const getJsonSettings = async () => {
  return require('../settings.json');
};

const getSettings = async (namespace = 'main') => {
  let settings = await redis.hgetall(`${namespace}:settings`);
  if (!Object.keys(settings).length) {
    const jsonSettings = await getJsonSettings();
    settings = jsonSettings?.[namespace];
    await updateSettings(settings);
  }
  return settings;
};

const syncSettings = async () => {
  const jsonSettings = await getJsonSettings();
  for (const namespace in jsonSettings) {
    await redis.hmset(`${namespace}:settings`, jsonSettings[namespace]);
  }
};

const updateSettings = async (settings, updateNamespace = 'main') => {
  await redis.hmset(`${updateNamespace}:settings`, settings);
  const response = await redis.hgetall(`${updateNamespace}:settings`);
  if (configs.nodeEnv !== 'development') {
    let jsonSettings = await getJsonSettings();
    jsonSettings[updateNamespace] = settings;
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '../settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(jsonSettings, null, 2));
  }
  return response;
};

const isMaintenance = ({ settings }) => {
  const { isMaintenance } = settings;
  if (typeof isMaintenance === 'string') {
    return isMaintenance.toLowerCase() === 'true';
  }
  return isMaintenance;
};

const getWebUrl = () => {
  return configs.webUrl;
}

module.exports = {
  getSettings,
  syncSettings,
  updateSettings,
  isMaintenance,
  getWebUrl
};
