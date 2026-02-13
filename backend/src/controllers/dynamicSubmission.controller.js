const DynamicSubmission = require('../models/DynamicSubmission');
const FormTemplate = require('../models/FormTemplate');

// @desc    Create a new submission
// @route   POST /api/dynamic-submissions
// @access  Public (or protected depending on requirement)
exports.createSubmission = async (req, res) => {
    try {
        const { templateId, data, photos, signature, submittedBy, location } = req.body;

        // Verify template exists
        const template = await FormTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        const submission = await DynamicSubmission.create({
            templateId,
            data,
            photos,
            signature,
            submittedBy,
            location
        });

        res.status(201).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all submissions for a specific template
// @route   GET /api/dynamic-submissions/template/:templateId
// @access  Private/Admin
exports.getSubmissionsByTemplate = async (req, res) => {
    try {
        const submissions = await DynamicSubmission.find({ templateId: req.params.templateId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all submissions (global list for admin)
// @route   GET /api/dynamic-submissions
// @access  Private/Admin
exports.getAllDynamicSubmissions = async (req, res) => {
    try {
        const submissions = await DynamicSubmission.find()
            .populate('templateId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: submissions.length, data: submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single submission
// @route   GET /api/dynamic-submissions/:id
// @access  Private/Admin
exports.getSubmission = async (req, res) => {
    try {
        const submission = await DynamicSubmission.findById(req.params.id)
            .populate('templateId', 'title fields');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Delete submission
// @route   DELETE /api/dynamic-submissions/:id
// @access  Private/Admin
exports.deleteSubmission = async (req, res) => {
    try {
        const submission = await DynamicSubmission.findByIdAndDelete(req.params.id);

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, message: 'Submission deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Update submission
// @route   PUT /api/dynamic-submissions/:id
// @access  Private/Admin
exports.updateSubmission = async (req, res) => {
    try {
        const { data, photos, signature, submittedBy, location } = req.body;

        const submission = await DynamicSubmission.findByIdAndUpdate(
            req.params.id,
            { data, photos, signature, submittedBy, location },
            { new: true, runValidators: true }
        );

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, data: submission });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
