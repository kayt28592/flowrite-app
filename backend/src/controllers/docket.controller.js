const asyncHandler = require('express-async-handler');
const docketService = require('../services/docket.service');

const getDockets = asyncHandler(async (req, res) => {
  const result = await docketService.getDockets(req.query);
  res.status(200).json({ success: true, ...result });
});

const getDocket = asyncHandler(async (req, res) => {
  const docket = await docketService.getDocketById(req.params.id);
  res.status(200).json({ success: true, data: docket });
});

const generateDocket = asyncHandler(async (req, res) => {
  const docket = await docketService.generateDocket(req.body, req.user?.id || null);
  res.status(201).json({ success: true, data: docket });
});

const deleteDocket = asyncHandler(async (req, res) => {
  await docketService.deleteDocket(req.params.id);
  res.status(200).json({ success: true, message: 'Docket deleted successfully' });
});

const previewDocket = asyncHandler(async (req, res) => {
  const data = await docketService.getPreviewDocket(req.body);
  res.status(200).json({ success: true, data });
});

const getDocketStats = asyncHandler(async (req, res) => {
  const stats = await docketService.getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});

module.exports = { getDockets, getDocket, generateDocket, deleteDocket, previewDocket, getDocketStats };
