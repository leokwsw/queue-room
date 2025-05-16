const { v4: uuidV4 } = require('uuid');

const generateQueueId = () => {
  return uuidV4();
};

module.exports = {
  generateQueueId,
};
