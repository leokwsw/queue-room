const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');

router.get('/get-settings/:namespace', settingController.getSettings);
router.get('/sync-settings', settingController.syncSettings);
router.post('/update-settings/:namespace', settingController.updateSettings);
router.get('/check-maintenance', settingController.checkMaintenance);
router.get('/web-url', settingController.getWebUrl);

module.exports = router;
