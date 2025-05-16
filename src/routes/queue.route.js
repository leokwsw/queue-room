const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');

router.post('/check-queue-onboarding-status', queueController.checkOnboard);
router.post('/check-queue-online-status', queueController.checkOnline);
router.post('/current-position', queueController.getWaitingPosition);
router.get('/extend-online', queueController.extendOnboard);
router.get('/extend-onboard', queueController.extendOnboard);
router.get('/status', queueController.getQueueStatus);
router.get('/summary', queueController.getQueueSummary);

module.exports = router;
