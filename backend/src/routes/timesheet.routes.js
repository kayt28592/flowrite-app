const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const rbac = require('../middleware/rbac.middleware');
const {
    getTimesheets,
    getTimesheet,
    createTimesheet,
    updateTimesheet,
    approveTimesheet,
    deleteTimesheet,
    getStats
} = require('../controllers/timesheet.controller');

router.use(protect);

router.get('/stats', rbac({
    or: [
        { page: 'timesheets', tab: 'my', action: 'view' },
        { page: 'timesheets', tab: 'team', action: 'view' }
    ]
}), getStats);

router.route('/')
    .get(rbac({
        or: [
            { page: 'timesheets', tab: 'my', action: 'view' },
            { page: 'timesheets', tab: 'team', action: 'view' }
        ]
    }), getTimesheets)
    .post(rbac({
        or: [
            { page: 'timesheets', tab: 'my', action: 'create' },
            { page: 'timesheets', tab: 'team', action: 'create' } // Allow supervisor to create on behalf
        ]
    }), createTimesheet);

router.route('/:id')
    .get(rbac({
        or: [
            { page: 'timesheets', tab: 'my', action: 'view' },
            { page: 'timesheets', tab: 'team', action: 'view' }
        ]
    }), getTimesheet)
    .put(rbac({
        or: [
            { page: 'timesheets', tab: 'my', action: 'edit' },
            { page: 'timesheets', tab: 'team', action: 'edit' }
        ]
    }), updateTimesheet)
    .delete(rbac({
        or: [
            { page: 'timesheets', tab: 'my', action: 'delete' },
            { page: 'timesheets', tab: 'team', action: 'delete' }
        ]
    }), deleteTimesheet);

router.patch('/:id/approve', rbac('timesheets', 'team', 'approve'), approveTimesheet);

module.exports = router;
