const { DateTime } = require('luxon');
const queue = require('../util/queue');
const hashMap = require('../util/hash-map');
const jwt = require('../util/jwt');
const { ONBOARD } = require('../constants/status.constant');
const redis = require('../common/redis');

const getOnboardIndex = async ({ queueId, namespace }) => {
  return await queue.getIndex({
    queue: 'onboard:queue',
    queueId,
    namespace,
  });
};

const getOnboardCount = async ({ namespace }) => {
  return await queue.getCount({
    queue: 'onboard:queue',
    namespace,
  });
};

const getOnboardAccessToken = ({ queueId, onboardMaxIdleTime }) => {
  return jwt.sign({ queueId, status: ONBOARD }, parseInt(onboardMaxIdleTime));
};

const addToOnboard = async ({
  queueId,
  settings,
  namespace,
  ip,
  userAgent,
  payload = {},
}) => {
  try {
    const pipeline = redis.pipeline();
    const expiryTime = DateTime.now()
      .setZone('Asia/Hong_Kong')
      .plus({
        seconds: parseInt(settings.onboardMaxIdleTime),
      });
    queue.addToQueue({
      queue: 'onboard:queue',
      queueId,
      score: expiryTime.toFormat('yyyyMMddHHmmssSSS'),
      namespace,
      pipeline,
    });
    hashMap.addToHashMap({
      key: 'onboard',
      queueId,
      payload: {
        ip,
        userAgent,
        createdAt: payload?.createdAt
          ? payload?.createdAt
          : DateTime.now()
              .setZone('Asia/Hong_Kong')
              .toFormat('yyyy-MM-dd HH:mm:ss'),
        expiryAt: expiryTime.toFormat('yyyy-MM-dd HH:mm:ss'),
      },
      namespace,
      pipeline,
    });
    await pipeline.exec();
  } catch (e) {
    console.log(e);
  }
};

const removeFromOnboard = async ({ queueId, namespace }) => {
  try {
    const pipeline = redis.pipeline();
    await hashMap.removeFromHashMap({ key: 'onboard', queueId, namespace, pipeline });
    await queue.removeFromQueue({
      queue: 'onboard:queue',
      queueId,
      namespace,
      pipeline,
    });
    await pipeline.exec();
  } catch (e) {
    console.log(e);
  }
};

const getOnboardData = async ({ queueId, namespace }) => {
  const data = await hashMap.getHashMapValue({
    key: 'onboard',
    queueId,
    namespace,
  });
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

const getOnboardRemainTime = ({ onboardData }) => {
  if (!onboardData) {
    return 0;
  }
  const expiryTime = DateTime.fromFormat(
    onboardData.expiryAt,
    'yyyy-MM-dd HH:mm:ss',
    { zone: 'Asia/Hong_Kong' },
  );
  const now = DateTime.now().setZone('Asia/Hong_Kong');
  const remainTime = Math.round(
    expiryTime.diff(now, 'seconds').toObject().seconds * 0.75,
  );
  return remainTime > 0 ? remainTime : 0;
};

module.exports = {
  getOnboardIndex,
  getOnboardCount,
  getOnboardAccessToken,
  addToOnboard,
  removeFromOnboard,
  getOnboardData,
  getOnboardRemainTime,
};
