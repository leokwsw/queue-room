const { DateTime } = require('luxon');
const queue = require('../util/queue');
const jwt = require('../util/jwt');
const hashMap = require('../util/hash-map');
const { ONLINE } = require('../constants/status.constant');
const { getOnboardCount } = require('./onboard.service');
const redis = require('../common/redis');

const getOnlineIdleMessage = ({ idleMinutes, language = '' }) => {
  if (language && language.toLowerCase().includes('en')) {
    return `You’ve been idle for over ${idleMinutes} minutes. Sorry, you’ll need to queue up again to enter.`;
  }
  return `你已閒置超過 ${idleMinutes} 分鐘，唔好意思，需要重新排隊再入嚟。`;
};

const addToOnline = async ({ queueId, payload, namespace }) => {
  await hashMap.addToHashMap({
    key: 'online',
    queueId,
    payload: {
      ...payload,
      createdAt: DateTime.now()
        .setZone('Asia/Hong_Kong')
        .toFormat('yyyy-MM-dd HH:mm:ss'),
    },
    namespace,
  });
};

const removeFromOnline = async ({ queueId, namespace }) => {
  try {
    const pipeline = redis.pipeline();
    await hashMap.removeFromHashMap({ key: 'online', queueId, namespace, pipeline });
    await queue.removeFromQueue({
      queue: 'online:queue',
      queueId,
      namespace,
      pipeline,
    });
    await pipeline.exec();
  } catch (e) {
    console.log(e);
  }
};

const getOnlineCount = async ({ namespace }) => {
  return await queue.getCount({
    queue: 'online:queue',
    namespace,
  });
};

const getOnlineAccessToken = ({ queueId, extendOnlineTime }) => {
  return jwt.sign({ queueId, status: ONLINE }, parseInt(extendOnlineTime));
};

const extendOnline = async ({
  queueId,
  namespace,
  extendOnlineTime,
  withAccessToken = true,
}) => {
  const response = await queue.addToQueue({
    queue: 'online:queue',
    queueId,
    score: DateTime.now()
      .setZone('Asia/Hong_Kong')
      .plus({ seconds: parseInt(extendOnlineTime) })
      .toFormat('yyyyMMddHHmmssSSS'),
    namespace,
  });
  if (withAccessToken) {
    return getOnlineAccessToken({ queueId, extendOnlineTime });
  }
  return response;
};

const makeUserOnline = async ({
  queueId,
  namespace,
  settings,
  ip,
  userAgent,
  extendOnlineTime = null,
}) => {
  await addToOnline({
    queueId,
    payload: { ip, userAgent },
    namespace,
  });
  return await extendOnline({
    queueId,
    extendOnlineTime: extendOnlineTime
      ? extendOnlineTime
      : settings.extendOnlineTime,
    namespace,
  });
};

const getOnlineData = async ({ queueId, namespace }) => {
  const data = await hashMap.getHashMapValue({
    key: 'online',
    queueId,
    namespace,
  });
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

const getOnlineSpaces = async ({ settings, namespace }) => {
  const onlineCount = await getOnlineCount({ namespace });
  const onboardCount = await getOnboardCount({ namespace });
  const spaces = parseInt(settings.onlineLimit) - onlineCount - onboardCount;
  return spaces > 0 ? spaces : 0;
};

module.exports = {
  getOnlineIdleMessage,
  addToOnline,
  removeFromOnline,
  getOnlineCount,
  getOnlineAccessToken,
  extendOnline,
  makeUserOnline,
  getOnlineData,
  getOnlineSpaces,
};
