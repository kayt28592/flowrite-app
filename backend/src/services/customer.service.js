const Customer = require('../models/Customer');
const { ErrorResponse } = require('../middleware/error.middleware');

const getCustomers = async (query) => {
  const { search, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  let filter = {};
  if (search) {
    filter = { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] };
  }

  const customers = await Customer.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
  const total = await Customer.countDocuments(filter);

  return { customers, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
};

const getCustomerById = async (id) => {
  const customer = await Customer.findById(id);
  if (!customer) throw new ErrorResponse('Customer not found', 404);
  return customer;
};

const createCustomer = async (data, userId) => {
  const customer = await Customer.create({ ...data, createdBy: userId });
  return customer;
};

const updateCustomer = async (id, data) => {
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!customer) throw new ErrorResponse('Customer not found', 404);
  return customer;
};

const deleteCustomer = async (id) => {
  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new ErrorResponse('Customer not found', 404);
  return customer;
};

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
