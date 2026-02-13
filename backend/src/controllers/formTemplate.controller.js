const FormTemplate = require('../models/FormTemplate');

// @desc    Get all active templates
// @route   GET /api/form-templates
// @access  Private/Admin
exports.getTemplates = async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.user.role !== 'admin') {
            query.status = 'published';
        }
        const templates = await FormTemplate.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: templates.length, data: templates });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single template
// @route   GET /api/form-templates/:id
// @access  Public
exports.getTemplate = async (req, res) => {
    try {
        const template = await FormTemplate.findById(req.params.id);
        if (!template || template.isDeleted) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: template });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create template
// @route   POST /api/form-templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
    try {
        const template = await FormTemplate.create({
            ...req.body,
            createdBy: req.user?._id
        });
        res.status(201).json({ success: true, data: template });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update template
// @route   PUT /api/form-templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
    try {
        const template = await FormTemplate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: template });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Soft delete template
// @route   DELETE /api/form-templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await FormTemplate.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, message: 'Template deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Clone template
// @route   POST /api/form-templates/:id/clone
// @access  Private/Admin
exports.cloneTemplate = async (req, res) => {
    try {
        const template = await FormTemplate.findById(req.params.id);
        if (!template || template.isDeleted) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const newTemplate = new FormTemplate({
            title: `${template.title} (Copy)`,
            description: template.description,
            fields: template.fields,
            status: 'draft',
            version: 1,
            createdBy: req.user?._id
        });

        await newTemplate.save();
        res.status(201).json({ success: true, data: newTemplate });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
