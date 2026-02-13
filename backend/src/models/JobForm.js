const mongoose = require('mongoose');

const jobFormSchema = new mongoose.Schema(
    {
        workerName: {
            type: String,
            required: [true, 'Worker name is required'],
            trim: true
        },
        plant: {
            type: String,
            required: [true, 'Plant information is required'],
            trim: true
        },
        machineHours: {
            type: Number,
            required: [true, 'Machine hours are required']
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        // Declarations
        declarations: {
            fitForWork: { type: String, required: true },
            covid19: { type: String, required: true },
            riskAssessment: { type: String, required: true }
        },
        // Checklist items
        checklist: {
            type: Map,
            of: new mongoose.Schema({
                ok: { type: Boolean, default: false },
                notes: { type: String, default: '' }
            }, { _id: false })
        },
        // Comments
        commentsDefect: { type: String, default: '' },
        actionTaken: { type: String, default: '' },
        // Photos (URLs from Cloudinary/uploaded path)
        photos: {
            photo1: { type: String, default: null },
            photo2: { type: String, default: null },
            photo3: { type: String, default: null },
            photo4: { type: String, default: null }
        },
        // Signature
        signature: {
            type: String,
            required: [true, 'Signature is required']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('JobForm', jobFormSchema);
