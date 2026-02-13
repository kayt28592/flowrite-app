const express = require('express');
const router = express.Router();
const {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate
} = require('../controllers/formTemplate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route for workers/anyone to fetch template for submission by ID
router.get('/:id', getTemplate);

// Protect all following routes
router.use(protect);

// GET / - List templates
// Accessible by Admin and User (filtered in controller)
router.get('/', getTemplates);

// Admin and Manager Only Routes below
router.use(authorize('admin', 'manager', 'Supervisor', 'Administrator'));

// POST / - Create template
router.post('/', createTemplate);

// ID-based Admin routes
router.route('/:id')
    .put(updateTemplate)
    .delete(deleteTemplate);

router.post('/:id/clone', cloneTemplate);

module.exports = router;
