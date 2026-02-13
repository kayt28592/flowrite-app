const express = require('express');
const {
    getJobForms,
    getJobFormById,
    createJobForm,
    updateJobForm,
    deleteJobForm
} = require('../controllers/jobForm.controller');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

// Public routes
router.route('/').post(createJobForm);

// Protected routes
router.use(protect);

router.route('/').get(getJobForms);

router
    .route('/:id')
    .get(getJobFormById)
    .put(updateJobForm)
    .delete(deleteJobForm);

module.exports = router;
