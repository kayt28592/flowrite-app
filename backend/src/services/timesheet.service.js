const Timesheet = require('../models/Timesheet');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error.middleware');

// Helper to check if role has elevated access
const isElevated = (role) => ['admin', 'administrator'].includes(role?.toLowerCase());
const isStaff = (role) => ['user', 'staff'].includes(role?.toLowerCase());
const isSupervisor = (role) => ['supervisor', 'manager'].includes(role?.toLowerCase());

const getTimesheets = async (query, user) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;

    let filter = {};

    // Role based filtering logic
    if (isStaff(user.role)) {
        // Staff can only see their own submissions OR requests sent TO them
        filter.staffId = user.id;
    } else if (isSupervisor(user.role)) {
        // Supervisor can see everyone's logs if they have "Manage" access
        // The middleware/router level RBAC handles the tab access
        if (query.viewMode === 'my') {
            filter.staffId = user.id;
        } else {
            // Team view - usually Supervisor/Admin view
            if (query.staffId) filter.staffId = query.staffId;
        }
    } else if (isElevated(user.role)) {
        if (query.staffId) filter.staffId = query.staffId;
    } else {
        filter.staffId = user.id;
    }

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.staffName) filter.staffName = new RegExp(query.staffName, 'i');

    if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = query.startDate;
        if (query.endDate) filter.date.$lte = query.endDate;
    }

    const timesheets = await Timesheet.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1, createdAt: -1 });

    const total = await Timesheet.countDocuments(filter);

    return {
        timesheets,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

const getTimesheetById = async (id, user) => {
    const timesheet = await Timesheet.findById(id);
    if (!timesheet) throw new ErrorResponse('Timesheet not found', 404);

    // Authorization check
    if (isStaff(user.role) && timesheet.staffId.toString() !== user.id) {
        throw new ErrorResponse('Not authorized to view this timesheet', 403);
    }

    return timesheet;
};

const createTimesheet = async (data, user) => {
    let staffId = user.id;
    let staffName = user.name;
    let status = 'Submitted';
    let type = 'Submission';

    // Supervisor/Admin creating an entry for someone else
    if ((isSupervisor(user.role) || isElevated(user.role)) && data.staffId && data.staffId !== user.id) {
        const targetUser = await User.findById(data.staffId);
        if (!targetUser) throw new ErrorResponse('Target staff not found', 404);
        staffId = targetUser.id;
        staffName = targetUser.name;

        // If hours are provided (totalHours > 0), treat as direct submission (logging on behalf)
        // If hours are 0 or not provided, treat as a request/order
        if (data.totalHours > 0) {
            status = 'Submitted';
            type = 'Submission';
        } else {
            status = 'Requested';
            type = 'Request';
        }
    }

    const payload = {
        ...data,
        staffId,
        staffName,
        status,
        type,
        managerId: type === 'Request' ? user.id : undefined,
        managerName: type === 'Request' ? user.name : undefined
    };

    const timesheet = await Timesheet.create(payload);
    return timesheet;
};

const updateTimesheet = async (id, data, user) => {
    const timesheet = await Timesheet.findById(id);
    if (!timesheet) throw new ErrorResponse('Timesheet not found', 404);

    const isAdmin = isElevated(user.role);

    if (isStaff(user.role) || (isSupervisor(user.role) && timesheet.staffId.toString() === user.id)) {
        if (timesheet.staffId.toString() !== user.id && !isAdmin) {
            throw new ErrorResponse('Not authorized to update this timesheet', 403);
        }

        // Rule: Cannot edit after submitted/approved unless admin or rejected
        if (timesheet.status !== 'Submitted' && timesheet.status !== 'Rejected' && timesheet.status !== 'Requested' && !isAdmin) {
            throw new ErrorResponse('Cannot edit a processed record', 400);
        }

        const updateData = {
            ...data,
            status: timesheet.status === 'Requested' ? 'Submitted' : 'Submitted' // Resubmitting
        };

        const updated = await Timesheet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        return updated;
    }

    if (isAdmin || isSupervisor(user.role)) {
        const updated = await Timesheet.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return updated;
    }

    throw new ErrorResponse('Not authorized', 403);
};

const approveTimesheet = async (id, data, user) => {
    if (!isElevated(user.role) && !isSupervisor(user.role)) {
        throw new ErrorResponse('Not authorized to verify records', 403);
    }

    const timesheet = await Timesheet.findById(id);
    if (!timesheet) throw new ErrorResponse('Timesheet not found', 404);

    const updateData = {
        status: data.status,
        managerId: user.id,
        managerName: user.name,
        managerNotes: data.managerNotes,
        rejectionReason: data.status === 'Rejected' ? (data.rejectionReason || data.managerNotes) : undefined,
        confirmedAt: data.status === 'Approved' ? new Date() : undefined
    };

    const updated = await Timesheet.findByIdAndUpdate(id, updateData, { new: true });
    return updated;
};

const deleteTimesheet = async (id, user) => {
    const timesheet = await Timesheet.findById(id);
    if (!timesheet) throw new ErrorResponse('Timesheet not found', 404);

    const isAdmin = isElevated(user.role);

    if (isStaff(user.role) && timesheet.staffId.toString() === user.id) {
        if (timesheet.status !== 'Submitted' && timesheet.status !== 'Requested' && !isAdmin) {
            throw new ErrorResponse('Cannot delete processed records', 400);
        }
    } else if (!isAdmin && !isSupervisor(user.role)) {
        throw new ErrorResponse('Not authorized', 403);
    }

    await Timesheet.findByIdAndDelete(id);
    return true;
};

const getStats = async (user) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    let filter = {};
    if (isStaff(user.role)) {
        filter.staffId = user.id;
    }

    const allRecords = await Timesheet.find(filter);

    const weekHours = allRecords.filter(r => r.date >= startOfWeekStr).reduce((acc, r) => acc + (r.totalHours || 0), 0);
    const monthHours = allRecords.filter(r => r.date >= startOfMonthStr).reduce((acc, r) => acc + (r.totalHours || 0), 0);
    const pendingCount = allRecords.filter(r => r.status === 'Submitted').length;

    return {
        thisWeekHours: Number(weekHours.toFixed(2)),
        thisMonthHours: Number(monthHours.toFixed(2)),
        pendingCount
    };
};

module.exports = {
    getTimesheets,
    getTimesheetById,
    createTimesheet,
    updateTimesheet,
    approveTimesheet,
    deleteTimesheet,
    getStats
};
