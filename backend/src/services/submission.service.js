const Submission = require('../models/Submission');
const { ErrorResponse } = require('../middleware/error.middleware');

const getSubmissions = async (query, user) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  let filter = {};

  // Own data only rule for Staff
  if (user.role === 'Staff' || user.role === 'user') {
    filter.createdBy = user.id;
  }

  if (query.customer) filter.customer = new RegExp(query.customer, 'i');
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  // Exclude large fields from list view to improve performance and prevent timeouts
  const submissions = await Submission.find(filter)
    .select('-signature -ticketImage')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1, createdAt: -1 });

  const total = await Submission.countDocuments(filter);

  return {
    submissions,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getSubmissionById = async (id, user) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new ErrorResponse('Submission not found', 404);

  if ((user.role === 'Staff' || user.role === 'user') && submission.createdBy?.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to view this record', 403);
  }

  return submission;
};

const createSubmission = async (data, userId) => {
  const submission = await Submission.create({ ...data, createdBy: userId });
  return submission;
};

const updateSubmission = async (id, data, user) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new ErrorResponse('Submission not found', 404);

  if ((user.role === 'Staff' || user.role === 'user') && submission.createdBy?.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to update this record', 403);
  }

  const updated = await Submission.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  return updated;
};

const deleteSubmission = async (id, user) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new ErrorResponse('Submission not found', 404);

  if ((user.role === 'Staff' || user.role === 'user') && submission.createdBy?.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to delete this record', 403);
  }

  await Submission.findByIdAndDelete(id);
  return submission;
};

module.exports = { getSubmissions, getSubmissionById, createSubmission, updateSubmission, deleteSubmission };
