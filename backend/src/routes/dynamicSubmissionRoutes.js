const express = require('express');
const router = express.Router();
const {
    createSubmission,
    getSubmissionsByTemplate,
    getAllDynamicSubmissions,
    getSubmission,
    deleteSubmission,
    updateSubmission
} = require('../controllers/dynamicSubmission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route to submit
router.post('/', createSubmission);

// Protected Admin and Manager routes
router.use(protect);
router.use(authorize('admin', 'manager', 'Supervisor', 'Administrator'));

router.get('/', getAllDynamicSubmissions);
router.get('/:id', getSubmission);
router.put('/:id', updateSubmission);
router.get('/template/:templateId', getSubmissionsByTemplate);
router.delete('/:id', deleteSubmission);

module.exports = router;
