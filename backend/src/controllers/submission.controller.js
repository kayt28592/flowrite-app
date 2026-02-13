const asyncHandler = require('express-async-handler');
const submissionService = require('../services/submission.service');

const getSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getSubmissions(req.query, req.user);
  res.status(200).json({ success: true, ...result });
});

const getSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmissionById(req.params.id, req.user);
  res.status(200).json({ success: true, data: submission });
});

const createSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.createSubmission(req.body, req.user?.id || null);
  res.status(201).json({ success: true, data: submission });
});

const updateSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmission(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: submission });
});

const deleteSubmission = asyncHandler(async (req, res) => {
  await submissionService.deleteSubmission(req.params.id, req.user);
  res.status(200).json({ success: true, message: 'Submission deleted successfully' });
});

module.exports = { getSubmissions, getSubmission, createSubmission, updateSubmission, deleteSubmission };
