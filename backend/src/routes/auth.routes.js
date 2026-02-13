const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
