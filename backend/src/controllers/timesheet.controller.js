const asyncHandler = require('express-async-handler');
const timesheetService = require('../services/timesheet.service');

const getTimesheets = asyncHandler(async (req, res) => {
    const result = await timesheetService.getTimesheets(req.query, req.user);
    res.status(200).json({ success: true, ...result });
});

const getTimesheet = asyncHandler(async (req, res) => {
    const timesheet = await timesheetService.getTimesheetById(req.params.id, req.user);
    res.status(200).json({ success: true, data: timesheet });
});

const createTimesheet = asyncHandler(async (req, res) => {
    const timesheet = await timesheetService.createTimesheet(req.body, req.user);
    res.status(201).json({ success: true, data: timesheet });
});

const updateTimesheet = asyncHandler(async (req, res) => {
    const timesheet = await timesheetService.updateTimesheet(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: timesheet });
});

const approveTimesheet = asyncHandler(async (req, res) => {
    const timesheet = await timesheetService.approveTimesheet(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: timesheet });
});

const deleteTimesheet = asyncHandler(async (req, res) => {
    await timesheetService.deleteTimesheet(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Timesheet deleted successfully' });
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await timesheetService.getStats(req.user);
    res.status(200).json({ success: true, data: stats });
});

module.exports = {
    getTimesheets,
    getTimesheet,
    createTimesheet,
    updateTimesheet,
    approveTimesheet,
    deleteTimesheet,
    getStats
};
