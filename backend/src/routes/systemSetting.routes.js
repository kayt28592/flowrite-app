const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getSettings, updateSetting } = require('../controllers/systemSetting.controller');

// Publicly accessible settings (necessary for RBAC matrix detection)
router.get('/', getSettings);

// Protected update route
router.put('/', protect, authorize('admin'), updateSetting);

module.exports = router;
