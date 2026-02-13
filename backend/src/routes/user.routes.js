const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
} = require('../controllers/user.controller');

const router = express.Router();

// All routes are protected and restricted to admin
// All routes are protected
router.use(protect);

router
    .route('/')
    .get(authorize('admin', 'manager', 'Supervisor', 'Administrator'), getUsers)
    .post(authorize('admin', 'Administrator'), createUser);

router
    .route('/:id')
    .put(authorize('admin', 'Administrator'), updateUser)
    .delete(authorize('admin', 'Administrator'), deleteUser);

router.patch('/:id/status', authorize('admin', 'Administrator'), updateUserStatus);

module.exports = router;
