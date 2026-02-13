const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        staffName: {
            type: String,
            required: true,
        },
        date: {
            type: String, // ISO format date YYYY-MM-DD
            required: true,
        },
        startTime: {
            type: String, // HH:mm format
            required: true,
        },
        endTime: {
            type: String, // HH:mm format
            required: true,
        },
        breakMinutes: {
            type: Number,
            default: 0,
        },
        totalMinutes: {
            type: Number,
            required: true,
        },
        totalHours: {
            type: Number,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ['Submission', 'Request'],
            default: 'Submission',
        },
        status: {
            type: String,
            enum: ['Submitted', 'Approved', 'Rejected', 'Requested'],
            default: 'Submitted',
        },
        rejectionReason: {
            type: String,
            trim: true,
        },
        confirmedAt: {
            type: Date,
        },
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        managerName: {
            type: String,
        },
        managerNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
timesheetSchema.index({ staffId: 1, date: -1 });
timesheetSchema.index({ status: 1 });
timesheetSchema.index({ date: -1 });

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

module.exports = Timesheet;
