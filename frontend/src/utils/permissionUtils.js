/**
 * Permission Utilities - DYNAMIC ACCESS CONTROL MODE
 * Enforces Role-Based Access Control (RBAC) across the application.
 * Honors the RBAC Matrix while enforcing data-level ownership rules.
 */

const getEffectiveRole = (user) => {
    if (!user) return 'Guest';
    let role = user.role;

    // Normalize mapping (Staff = user, Supervisor = manager)
    if (role === 'user') role = 'Staff';
    if (role === 'manager') role = 'Supervisor';

    // Ensure first letter capitalized for matrix consistency
    return role.charAt(0).toUpperCase() + role.slice(1);
};

/**
 * Page Level Access
 */
export const canAccessPage = (user, rbacMatrix, pageKey) => {
    const role = getEffectiveRole(user);

    // 1. Administrator is ALWAYS full access
    if (role === 'Admin' || role === 'Administrator') return true;

    // 2. Matrix Lookup (Honors user-defined configuration)
    const rolePermissions = rbacMatrix?.[role];
    if (!rolePermissions) {
        // Legacy/Default logic for authenticated users if matrix is missing
        if (role === 'Guest') return false;
        return true;
    }

    const pageTabs = rolePermissions[pageKey];
    if (!pageTabs) {
        // Hard fallback for Timesheets if matrix doesn't have the key yet
        if (pageKey === 'timesheets') return role === 'Staff';
        return role !== 'Guest';
    }

    // Page is accessible if any tab has 'view': true
    return Object.values(pageTabs).some(tab => tab.view === true);
};

/**
 * Tab Level Access
 */
export const canAccessTab = (user, rbacMatrix, pageKey, tabKey) => {
    const role = getEffectiveRole(user);

    // 1. Administrator full access
    if (role === 'Admin' || role === 'Administrator') return true;

    // 2. Matrix Lookup
    const rolePermissions = rbacMatrix?.[role];
    if (!rolePermissions) {
        if (role === 'Guest') return false;
        return true;
    }

    const tabPermissions = rolePermissions[pageKey]?.[tabKey];
    if (!tabPermissions) {
        // Fallback for Timesheets if matrix missing specific node
        if (pageKey === 'timesheets' && tabKey === 'team') return false;
        return role !== 'Guest';
    }

    return tabPermissions.view === true;
};

/**
 * Action Level Access
 * @param {object} context - Optional metadata (e.g., resource owner ID)
 */
export const canDoAction = (user, rbacMatrix, pageKey, tabKey, actionKey, context = null) => {
    const role = getEffectiveRole(user);

    // 1. Administrator full access
    if (role === 'Admin' || role === 'Administrator') return true;

    // 2. Ownership Verification (Data-layer protection)
    // Even if matrix says 'edit: true', Staff cannot edit others' timesheets
    if (pageKey === 'timesheets' && role === 'Staff') {
        if (context?.ownerId && context.ownerId !== user._id && context.ownerId !== user.id) {
            return false;
        }
    }

    // 3. Matrix Lookup
    const rolePermissions = rbacMatrix?.[role];
    if (!rolePermissions) {
        if (role === 'Guest') return false;
        return true;
    }

    const tabPermissions = rolePermissions[pageKey]?.[tabKey];
    if (!tabPermissions) {
        // Default Timesheets Staff logic if matrix uninitialized
        if (pageKey === 'timesheets' && role === 'Staff') {
            return ['view', 'create', 'submit'].includes(actionKey);
        }
        return role !== 'Guest';
    }

    // Action depends on view being enabled
    if (tabPermissions.view !== true) return false;

    return tabPermissions[actionKey] === true;
};
