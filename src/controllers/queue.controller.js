const onlineService = require('../services/online.service');
const onboardService = require('../services/onboard.service');
const waitingService = require('../services/waiting.service');
const settingService = require('../services/setting.service');
const queueService = require('../services/queue.service');
const common = require('../util/common');
const jwt = require('../util/jwt');
const config = require('../configs');
const { ONLINE, WAITING } = require('../constants/status.constant');

const extendOnboard = async (req, res) => {
  const { clientIp: ip, headers, settings, namespace, query } = req;
  const { queueId } = query;
  const userAgent = headers['user-agent'];

  const onboardData = await onboardService.getOnboardData({
    queueId,
    namespace,
  });
  if (onboardData && onboardService.getOnboardRemainTime({ onboardData })) {
    await onboardService.addToOnboard({
      queueId,
      settings,
      namespace,
      ip,
      userAgent,
      payload: onboardData,
    });
    return res.send({ status: true });
  }
  return res.send({ status: false });
};

const checkOnline = async (req, res) => {
  const {
    clientIp: ip,
    headers,
    namespace,
    settings,
    body,
    isInternalUser,
  } = req;
  const { idledTime, queueId, accessToken, isPayment } = body;
  const userAgent = headers['user-agent'];
  const language = headers['x-user-language'];
  let payload = { ip, userAgent };

  if (!queueId) {
    return res.send({
      isOnline: true,
      offlineMsg: null,
    });
  }

  const response = {
    isOnline: false,
    offlineMsg: onlineService.getOnlineIdleMessage({
      idleMinutes: Math.round(parseInt(settings.onlineMaxIdleTime / 60)),
      language,
    }),
    accessToken: null,
  };

  if (settingService.isMaintenance({ settings }) && !isInternalUser) {
    return res.send(response);
  }
  const onlineSpace = await onlineService.getOnlineSpaces({
    settings,
    namespace,
  });
  const waitingCount = await waitingService.getWaitingCount({ namespace });
  if (onlineSpace && waitingCount === 0) {
    const onlineUserData = await onlineService.getOnlineData({
      queueId,
      namespace,
    });
    if (!onlineUserData) {
      await onlineService.addToOnline({ queueId, payload, namespace });
    }
    return res.send({
      ...response,
      isOnline: true,
      offlineMsg: null,
      accessToken: await onlineService.extendOnline({
        queueId,
        namespace,
        extendOnlineTime: settings.extendOnlineTime,
      }),
    });
  }
  if (!accessToken && !isPayment) {
    await onlineService.removeFromOnline({ queueId, namespace });
    return res.send(response);
  }
  if (
    parseInt(idledTime) > parseInt(settings.onlineMaxIdleTime) &&
    !isPayment &&
    waitingCount > 0
  ) {
    // Idled too long
    console.log(`Idled too long - ${queueId}`);
    await onlineService.removeFromOnline({ queueId, namespace });
    return res.send(response);
  }
  try {
    const payload = jwt.verify(accessToken);
    const onlineUserData = await onlineService.getOnlineData({
      queueId,
      namespace,
    });
    if (!onlineUserData) {
      await onlineService.addToOnline({ queueId, payload, namespace });
    }
    return res.send({
      ...response,
      isOnline: true,
      offlineMsg: null,
      accessToken: await onlineService.extendOnline({
        queueId,
        namespace,
        extendOnlineTime: settings.extendOnlineTime,
      }),
    });
  } catch (error) {
    await onlineService.removeFromOnline({ queueId, namespace });
    return res.send(response);
  }
};

const getWaitingPosition = async (req, res) => {
  const { clientIp: ip, body, headers, settings, namespace } = req;
  let { queueId, accessToken } = body;
  const userAgent = headers['user-agent'];
  let position = null;
  if (!queueId) {
    queueId = common.generateQueueId();
  }
  const waitingData = await waitingService.getWaitingData({
    queueId,
    namespace,
  });
  let initialPosition = waitingData?.initialPosition
    ? waitingData?.initialPosition
    : -1;
  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken);
      if (payload?.status === WAITING) {
        const onboardData = await onboardService.getOnboardData({
          queueId,
          namespace,
        });
        const remainTime = onboardService.getOnboardRemainTime({ onboardData });
        if (onboardData && remainTime) {
          await waitingService.removeFromWaiting({ queueId, namespace });
          return res.send({
            waiting: false,
            initialPosition,
            position: -1,
            reserveTime: parseInt(settings.onboardMaxIdleTime) * 0.75,
            queueId: queueId,
            accessToken: onboardService.getOnboardAccessToken({
              queueId,
              onboardMaxIdleTime: settings.onboardMaxIdleTime,
            }),
            remainTime,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  let waitingIndex = await waitingService.getWaitingIndex({
    queueId,
    namespace,
  });
  if (waitingIndex === null) {
    position = await waitingService.addToWaiting({
      queueId,
      settings,
      namespace,
      ip,
      userAgent,
    });
  } else {
    position = waitingIndex + 1;
  }
  await waitingService.addToWaitingTimeout({ queueId, settings, namespace });
  return res.send({
    waiting: true,
    initialPosition: initialPosition === -1 ? position : initialPosition,
    position: position,
    reserveTime: parseInt(settings.onboardMaxIdleTime) * 0.75,
    queueId: queueId,
    accessToken: waitingService.getWaitingAccessToken({
      queueId,
      initialPosition,
      position,
      settings,
    }),
    remainTime: 0,
  });
};

const checkOnboard = async (req, res) => {
  const {
    clientIp: ip,
    namespace,
    settings,
    body,
    headers,
    isInternalUser,
  } = req;
  let { queueId, accessToken } = body;
  const userAgent = headers['user-agent'];
  if (!queueId) {
    queueId = common.generateQueueId();
  }
  const response = {
    checkOnlineStatusInterval: 20,
    queuePageUrl: null,
    updatedQueueId: queueId,
    accessToken: null,
  };

  if (settingService.isMaintenance({ settings }) && !isInternalUser) {
    return res.send({ ...response, queuePageUrl: config.maintenancePageUrl });
  }

  // If online access token is existed
  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken);
      if (payload?.status === ONLINE) {
        return res.send({
          ...response,
          accessToken: await onlineService.makeUserOnline({
            queueId,
            namespace,
            settings,
            ip,
            userAgent,
            extendOnlineTime: isInternalUser ? '86400' : null,
          }),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (
    (await onlineService.getOnlineSpaces({ settings, namespace })) ||
    isInternalUser
  ) {
    return res.send({
      ...response,
      accessToken: await onlineService.makeUserOnline({
        queueId,
        namespace,
        settings,
        ip,
        userAgent,
        extendOnlineTime: isInternalUser ? '86400' : null,
      }),
    });
  }
  // No online spaces
  const onboardData = await onboardService.getOnboardData({
    queueId,
    namespace,
  });
  if (onboardData && onboardService.getOnboardRemainTime({ onboardData })) {
    await onboardService.removeFromOnboard({ queueId, namespace });
    return res.send({
      ...response,
      accessToken: await onlineService.makeUserOnline({
        queueId,
        namespace,
        settings,
        ip,
        userAgent,
      }),
    });
  }
  return res.send({
    ...response,
    queuePageUrl: `${config.waitingPageUrl}?queue_id=${queueId}`,
  });
};

const getQueueStatus = async (req, res) => {
  const { settings, namespace } = req;
  const summary = await queueService.getSummary({ namespace, settings });
  const online = await queueService.getOnline({ namespace });
  const onboard = await queueService.getOnboard({ namespace });
  const waiting = await queueService.getWaiting({ namespace });
  return res.send({
    summary,
    online,
    onboard,
    waiting,
  });
};

const getQueueSummary = async (req, res) => {
  const { settings, namespace } = req;
  const summary = await queueService.getSummary({ namespace, settings });
  return res.send({
    summary,
  });
};

module.exports = {
  extendOnboard,
  checkOnline,
  getWaitingPosition,
  checkOnboard,
  getQueueStatus,
  getQueueSummary,
};
