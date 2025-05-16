const hashmap = require('../util/hash-map');
const { getWaitingCount } = require('./waiting.service');
const { getOnboardCount } = require('./onboard.service');
const { getOnlineCount } = require('./online.service');

const getSummary = async ({ namespace, settings }) => {
  const onlineCount = await getOnlineCount({ namespace });
  const onboardCount = await getOnboardCount({ namespace });
  const waitingCount = await getWaitingCount({ namespace });
  return {
    onlineHardLimit: parseInt(settings.onlineLimit),
    onlineSoftLimit: parseInt(settings.onlineLimit),
    onlineCount,
    onboardCount,
    waitingCount,
  };
};

const getWaiting = async ({ namespace }) => {
  const waitingUsers = [];
  const users = await hashmap.getHashMapAll({ key: 'waiting', namespace });
  for (const userQueueId in users) {
    const user = JSON.parse(users[userQueueId]);
    waitingUsers.push({ ...user, queueId: userQueueId });
  }
  return waitingUsers.slice(0, 1000);
};

const getOnline = async ({ namespace }) => {
  const onlinUsers = [];
  const users = await hashmap.getHashMapAll({ key: 'online', namespace });
  for (const userQueueId in users) {
    const user = JSON.parse(users[userQueueId]);
    onlinUsers.push({ ...user, queueId: userQueueId });
  }
  return onlinUsers.slice(0, 1000);
};

const getOnboard = async ({ namespace }) => {
  const onboardUsers = [];
  const users = await hashmap.getHashMapAll({ key: 'onboard', namespace });
  for (const userQueueId in users) {
    const user = JSON.parse(users[userQueueId]);
    onboardUsers.push({ ...user, queueId: userQueueId });
  }
  return onboardUsers.slice(0, 1000);
};

module.exports = {
  getSummary,
  getWaiting,
  getOnboard,
  getOnline,
};
