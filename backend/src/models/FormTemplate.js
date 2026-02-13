const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['text', 'number', 'date', 'select', 'checkbox', 'signature', 'image', 'textarea', 'heading', 'checklist', 'declaration']
    },
    label: { type: String, required: true },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }], // For simple select
    items: [{ id: String, label: String, value: String }], // For checklist/declaration items
    order: { type: Number, required: true },
    validation: {
        min: Number,
        max: Number,
        pattern: String
    }
});

const formTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fields: [formFieldSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('FormTemplate', formTemplateSchema);
