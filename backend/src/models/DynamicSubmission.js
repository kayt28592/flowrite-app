const mongoose = require('mongoose');

const dynamicSubmissionSchema = new mongoose.Schema({
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormTemplate', required: true },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed // Stores fieldId: value
    },
    photos: [{
        fieldId: String,
        url: String
    }],
    signature: { type: String },
    submittedBy: {
        name: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    location: {
        lat: Number,
        lng: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DynamicSubmission', dynamicSubmissionSchema);
