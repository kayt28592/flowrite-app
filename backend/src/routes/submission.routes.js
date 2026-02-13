const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const rbac = require('../middleware/rbac.middleware');
const { getSubmissions, getSubmission, createSubmission, updateSubmission, deleteSubmission } = require('../controllers/submission.controller');

router.route('/')
    .get(rbac('dockets', 'submissions', 'view'), getSubmissions)
    .post(rbac('dockets', 'docketForm', 'create'), createSubmission);

router.route('/:id')
    .get(rbac('dockets', 'submissions', 'view'), getSubmission)
    .put(rbac('dockets', 'submissions', 'edit'), updateSubmission)
    .delete(rbac('dockets', 'submissions', 'delete'), deleteSubmission);

module.exports = router;
