const express = require('express');
const router = express.Router();
const rbac = require('../middleware/rbac.middleware');
const { getDockets, getDocket, generateDocket, deleteDocket, previewDocket, getDocketStats } = require('../controllers/docket.controller');

// Operational Archive
router.get('/', rbac('dockets', 'list', 'view'), getDockets);

// Analytics
router.get('/stats', rbac('dockets', 'list', 'view'), getDocketStats);

// Single Protocol Retrieval
router.get('/:id', rbac('dockets', 'list', 'view'), getDocket);

// Protocol Engineering (Generation)
router.post('/generate', rbac('dockets', 'docketForm', 'create'), generateDocket);

// Protocol Simulation (Preview)
router.post('/preview', rbac('dockets', 'docketForm', 'view'), previewDocket);

// Protocol Termination
router.delete('/:id', rbac('dockets', 'list', 'delete'), deleteDocket);

module.exports = router;
