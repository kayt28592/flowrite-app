const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const rbac = require('../middleware/rbac.middleware');
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customer.controller');

// Allow fetching customer list if user has Customer view permission
// OR if they have access to the Docket Form (dependency).
router.route('/')
    .get(rbac({
        or: [
            { page: 'dockets', tab: 'customers', action: 'view' },
            { page: 'dockets', tab: 'docketForm', action: 'view' }
        ]
    }, null, 'view'), getCustomers)
    .post(rbac({
        or: [
            { page: 'dockets', tab: 'customers', action: 'create' },
            { page: 'dockets', tab: 'docketForm', action: 'create' }
        ]
    }, null, 'create'), createCustomer);

router.route('/:id')
    .get(rbac({
        or: [
            { page: 'dockets', tab: 'customers', action: 'view' },
            { page: 'dockets', tab: 'docketForm', action: 'view' }
        ]
    }, null, 'view'), getCustomer)
    .put(protect, rbac('dockets', 'customers', 'edit'), updateCustomer)
    .delete(protect, rbac('dockets', 'customers', 'delete'), deleteCustomer);

module.exports = router;
