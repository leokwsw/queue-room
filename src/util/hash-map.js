const redis = require('../common/redis');

const addToHashMap = async ({
  key,
  queueId,
  payload,
  namespace = 'main',
  pipeline = null,
}) => {
  if (typeof payload === 'object') {
    payload = JSON.stringify(payload);
  }
  if (pipeline) {
    return pipeline.hset(`${namespace}:${key}`, queueId, payload);
  }
  return redis.hset(`${namespace}:${key}`, queueId, payload);
};
const removeFromHashMap = async ({
  key,
  queueId,
  namespace = 'main',
  pipeline = null,
}) => {
  if (pipeline) {
    return pipeline.hdel(`${namespace}:${key}`, queueId);
  }
  return redis.hdel(`${namespace}:${key}`, queueId);
};

const getHashMapValue = async ({ key, queueId, namespace = 'main' }) => {
  return redis.hget(`${namespace}:${key}`, queueId);
};

const getHashMapAll = async ({ key, namespace = 'main' }) => {
  return redis.hgetall(`${namespace}:${key}`);
};

module.exports = {
  addToHashMap,
  removeFromHashMap,
  getHashMapValue,
  getHashMapAll,
};
