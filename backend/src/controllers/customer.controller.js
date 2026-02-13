const asyncHandler = require('express-async-handler');
const customerService = require('../services/customer.service');

const getCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getCustomers(req.query);
  res.status(200).json({ success: true, ...result });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.status(200).json({ success: true, data: customer });
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body, req.user?.id || null);
  res.status(201).json({ success: true, data: customer });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.status(200).json({ success: true, data: customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.params.id);
  res.status(200).json({ success: true, message: 'Customer deleted successfully' });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
