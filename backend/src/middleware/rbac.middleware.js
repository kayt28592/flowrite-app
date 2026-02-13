const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');

const rbac = (pageKeyOrConfig, tabKey, actionKey) => {
    return async (req, res, next) => {
        let user = null;
        let token;

        // 1. Optional Token Retrieval
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token && token !== 'null' && token !== 'undefined') {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-password');
                if (user) req.user = user;
            } catch (error) {
                // Silently treat as guest
            }
        }

        const roleFromDB = user ? user.role : 'Guest';

        // Normalize role to match Matrix keys (Case Insensitive Matching)
        let matrixRole = roleFromDB;
        if (roleFromDB === 'user') matrixRole = 'Staff';
        if (roleFromDB === 'manager') matrixRole = 'Supervisor';

        // Final normalization to CamelCase (e.g., Staff, Supervisor, Guest, Administrator)
        matrixRole = matrixRole.charAt(0).toUpperCase() + matrixRole.slice(1).toLowerCase();

        // 2. Administrator Bypass
        if (matrixRole === 'Admin' || matrixRole === 'Administrator' || roleFromDB === 'admin') return next();

        // 3. Matrix Lookup
        try {
            const matrixSetting = await SystemSetting.findOne({ key: 'rbac_matrix' });
            if (!matrixSetting) {
                if (matrixRole === 'Guest') return res.status(401).json({ success: false, message: 'Authentication required for this protocol.' });
                return next(); // Default fallback for authenticated users
            }

            const matrix = matrixSetting.value;
            // Case insensitive role lookup
            const actualRoleKey = Object.keys(matrix).find(k => k.toLowerCase() === matrixRole.toLowerCase());
            const rolePerms = actualRoleKey ? matrix[actualRoleKey] : null;

            if (!rolePerms) {
                if (matrixRole === 'Guest') return res.status(403).json({ success: false, message: 'Guest Access Restricted: Node not found in matrix.' });
                return next();
            }

            const hasRequirement = (p, t, a) => {
                const module = rolePerms[p];
                if (!module) return false;
                const tab = module[t];
                return tab && (tab[a] === true || tab[a] === 'true');
            };

            let authorized = false;
            let requirementSummary = "";

            if (typeof pageKeyOrConfig === 'object' && pageKeyOrConfig.or) {
                authorized = pageKeyOrConfig.or.some(r => hasRequirement(r.page, r.tab, r.action));
                requirementSummary = pageKeyOrConfig.or.map(r => `${r.page}.${r.tab}`).join(' OR ');
                if (!actionKey) actionKey = pageKeyOrConfig.or[0].action;
            } else {
                authorized = hasRequirement(pageKeyOrConfig, tabKey, actionKey);
                requirementSummary = `${pageKeyOrConfig}.${tabKey}`;
            }

            if (authorized) return next();

            // Specialized error message for Guests to help debugging
            const debugInfo = process.env.NODE_ENV === 'development' ? ` (Role: ${matrixRole}, URL: ${req.originalUrl})` : '';

            return res.status(403).json({
                success: false,
                message: `Protocol Denied: ${matrixRole} not authorized for ${actionKey} on ${requirementSummary}${debugInfo}`
            });

        } catch (error) {
            console.error('RBAC Middleware Error:', error);
            res.status(500).json({ success: false, message: 'Security Protocol Error' });
        }
    };
};

module.exports = rbac;
