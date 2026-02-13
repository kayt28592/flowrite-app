const express = require('express');
const router = express.Router();
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/item.controller');
const { protect } = require('../middleware/auth.middleware');
const rbac = require('../middleware/rbac.middleware');

// Fetch items for selection (available to Guests/Staff if they can use the Docket Form)
router.get('/', rbac({
    or: [
        { page: 'dockets', tab: 'items', action: 'view' },
        { page: 'dockets', tab: 'docketForm', action: 'view' }
    ]
}, null, 'view'), getItems);

router.post('/', protect, rbac('dockets', 'items', 'create'), createItem);
router.put('/:id', protect, rbac('dockets', 'items', 'edit'), updateItem);
router.delete('/:id', protect, rbac('dockets', 'items', 'delete'), deleteItem);

module.exports = router;
