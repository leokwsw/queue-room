const { DateTime } = require('luxon');
const queue = require('../util/queue');
const hashMap = require('../util/hash-map');
const jwt = require('../util/jwt');
const common = require('../util/common');
const { WAITING } = require('../constants/status.constant');
const { getOnboardData } = require('./onboard.service');
const redis = require('../common/redis');

const getWaitingIndex = async ({ queueId, namespace }) => {
  return await queue.getIndex({
    queue: 'waiting:queue',
    queueId,
    namespace,
  });
};

const getWaitingData = async ({ queueId, namespace }) => {
  const data = await hashMap.getHashMapValue({
    key: 'waiting',
    queueId,
    namespace,
  });
  if (data) {
    return JSON.parse(data);
  }
  return null;
};

const addToWaiting = async ({ queueId, namespace, ip, userAgent }) => {
  await queue.addToQueue({
    queue: 'waiting:queue',
    queueId,
    score: DateTime.now()
      .setZone('Asia/Hong_Kong')
      .toFormat('yyyyMMddHHmmssSSS'),
    namespace,
  });
  const position = await queue.getIndex({
    queue: 'waiting:queue',
    queueId,
    namespace,
  });
  await hashMap.addToHashMap({
    key: 'waiting',
    queueId,
    payload: {
      ip,
      userAgent,
      createdAt: DateTime.now()
        .setZone('Asia/Hong_Kong')
        .toFormat('yyyy-MM-dd HH:mm:ss'),
      initialPosition: position + 1,
    },
    namespace,
  });
  return position + 1;
};

const addToWaitingTimeout = async ({ queueId, settings, namespace }) => {
  await queue.addToQueue({
    queue: 'waiting:timeout',
    queueId,
    score: DateTime.now()
      .setZone('Asia/Hong_Kong')
      .plus({ seconds: parseInt(settings.extendWaitingTime) })
      .toFormat('yyyyMMddHHmmssSSS'),
    namespace,
  });
};

const removeFromWaiting = async ({ queueId, namespace }) => {
  // TODO: CHANGE TO USE PIPELINE
  try {
    const pipeline = redis.pipeline();
    hashMap.removeFromHashMap({
      key: 'waiting',
      queueId,
      namespace,
      pipeline,
    });
    queue.removeFromQueue({
      queue: 'waiting:queue',
      queueId,
      namespace,
      pipeline,
    });
    queue.removeFromQueue({
      queue: 'waiting:timeout',
      queueId,
      namespace,
      pipeline,
    });
    await pipeline.exec();
  } catch (e) {
    console.log(e);
  }
};

const getWaitingAccessToken = ({
  queueId,
  initialPosition,
  position,
  settings,
}) => {
  return jwt.sign(
    {
      queueId,
      status: WAITING,
      initialPosition: initialPosition === -1 ? position : initialPosition,
    },
    parseInt(settings.extendWaitingTime),
  );
};

const getWaitingCount = async ({ namespace }) => {
  return await queue.getCount({
    queue: 'waiting:queue',
    namespace,
  });
};

module.exports = {
  getWaitingIndex,
  getWaitingData,
  addToWaiting,
  addToWaitingTimeout,
  removeFromWaiting,
  getWaitingAccessToken,
  getWaitingCount,
};
