const JobForm = require('../models/JobForm');
const asyncHandler = require('express-async-handler');
const { ErrorResponse } = require('../middleware/error.middleware');

// @desc    Get all job forms
// @route   GET /api/job-forms
// @access  Private
exports.getJobForms = asyncHandler(async (req, res, next) => {
    const jobForms = await JobForm.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: jobForms.length,
        data: jobForms
    });
});

// @desc    Get single job form
// @route   GET /api/job-forms/:id
// @access  Private
exports.getJobFormById = asyncHandler(async (req, res, next) => {
    const jobForm = await JobForm.findById(req.params.id);

    if (!jobForm) {
        return next(new ErrorResponse(`Job form not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: jobForm
    });
});

// @desc    Create new job form
// @route   POST /api/job-forms
// @access  Public
exports.createJobForm = asyncHandler(async (req, res, next) => {
    // Add user to req.body IF authenticated
    if (req.user) {
        req.body.createdBy = req.user.id;
    }

    const jobForm = await JobForm.create(req.body);

    res.status(201).json({
        success: true,
        data: jobForm
    });
});

// @desc    Update job form
// @route   PUT /api/job-forms/:id
// @access  Private
exports.updateJobForm = asyncHandler(async (req, res, next) => {
    let jobForm = await JobForm.findById(req.params.id);

    if (!jobForm) {
        return next(new ErrorResponse(`Job form not found with id of ${req.params.id}`, 404));
    }

    jobForm = await JobForm.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: jobForm
    });
});

// @desc    Delete job form
// @route   DELETE /api/job-forms/:id
// @access  Private
exports.deleteJobForm = asyncHandler(async (req, res, next) => {
    const jobForm = await JobForm.findById(req.params.id);

    if (!jobForm) {
        return next(new ErrorResponse(`Job form not found with id of ${req.params.id}`, 404));
    }

    await jobForm.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
