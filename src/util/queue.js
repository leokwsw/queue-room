const redis = require('../common/redis');

const addToQueue = async ({
  queue,
  queueId,
  score,
  namespace = 'main',
  pipeline = null,
}) => {
  if (pipeline) {
    return pipeline.zadd(`${namespace}:${queue}`, score, queueId);
  }
  return redis.zadd(`${namespace}:${queue}`, score, queueId);
};

const removeFromQueue = async ({
  queue,
  queueId,
  namespace = 'main',
  pipeline = null,
}) => {
  if (pipeline) {
    return pipeline.zrem(`${namespace}:${queue}`, queueId);
  }
  return redis.zrem(`${namespace}:${queue}`, queueId);
};

const getIndex = async ({ queue, queueId, namespace = 'main' }) => {
  return redis.zrank(`${namespace}:${queue}`, queueId);
};

const addScore = ({ queue, queueId, score, namespace = 'main' }) => {};

const getCount = async ({ queue, namespace }) => {
  return redis.zcount(`${namespace}:${queue}`, '-inf', '+inf');
};

module.exports = {
  addToQueue,
  removeFromQueue,
  getIndex,
  addScore,
  getCount,
};
