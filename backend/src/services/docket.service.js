const Docket = require('../models/Docket');
const Submission = require('../models/Submission');
const Customer = require('../models/Customer');
const { ErrorResponse } = require('../middleware/error.middleware');

const Item = require('../models/Item');

const getDockets = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  let filter = {};
  if (query.customer) filter.customer = new RegExp(query.customer, 'i');

  const dockets = await Docket.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: 'submissions',
      select: '-signature -ticketImage'
    });

  const total = await Docket.countDocuments(filter);

  // Only fetch items if we have dockets to process
  let priceMap = {};
  if (dockets.length > 0) {
    const items = await Item.find({}).select('name price');
    items.forEach(i => {
      if (i.name) priceMap[i.name.trim().toLowerCase()] = i.price || 0;
    });
  }

  // Process dockets to include virtual stats
  const processedDockets = dockets.map(d => {
    const doc = d.toObject();

    // Ensure submissions is an array
    const subs = Array.isArray(doc.submissions) ? doc.submissions : [];

    // Filter out null submissions (cases where submission was deleted)
    const validSubmissions = subs.filter(s => s !== null && typeof s === 'object');

    doc.totalQuantity = validSubmissions.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0);
    doc.totalRevenue = validSubmissions.reduce((sum, sub) => {
      const orderName = (sub.order || "").trim().toLowerCase();
      const price = priceMap[orderName] || 0;
      const amount = Number(sub.amount) || 0;
      return sum + (amount * price);
    }, 0);

    // Alias for frontend compatibility
    doc.totalAmount = doc.totalQuantity;
    doc.unit = validSubmissions[0]?.unit || 'm³';

    return doc;
  });

  return {
    dockets: processedDockets,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getDocketById = async (id) => {
  const docket = await Docket.findById(id).populate('submissions');
  if (!docket) throw new ErrorResponse('Docket not found', 404);

  const items = await Item.find({});
  const priceMap = {};
  items.forEach(i => {
    if (i.name) priceMap[i.name.trim().toLowerCase()] = i.price || 0;
  });

  const doc = docket.toObject();
  if (doc.submissions && doc.submissions.length > 0) {
    const validSubmissions = doc.submissions.filter(s => s !== null);

    doc.totalQuantity = validSubmissions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    doc.totalRevenue = validSubmissions.reduce((sum, sub) => {
      const orderName = (sub.order || "").trim().toLowerCase();
      const price = priceMap[orderName] || 0;
      return sum + ((sub.amount || 0) * price);
    }, 0);
    doc.totalAmount = doc.totalQuantity;
    doc.unit = validSubmissions[0]?.unit || 'm³';
  }

  return doc;
};

const generateDocket = async (data, userId) => {
  const { customer, startDate, endDate } = data;

  // Check for duplicate docket
  const existingDocket = await Docket.findOne({
    customer: new RegExp(`^${customer}$`, 'i'),
    startDate: new Date(startDate),
    endDate: new Date(endDate)
  });

  if (existingDocket) {
    throw new ErrorResponse(`A docket already exists for ${customer} for this period (${existingDocket.docketNumber}).`, 400);
  }

  const submissions = await Submission.find({ customer, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });

  if (submissions.length === 0) {
    throw new ErrorResponse('No submissions found for this period', 404);
  }

  // Calculate Total Quantity: sum(amount)
  const totalAmount = submissions.reduce((sum, sub) => sum + sub.amount, 0);

  const customerInfo = await Customer.findOne({ name: new RegExp(`^${customer}$`, 'i') });

  const docket = await Docket.create({
    customer,
    customerInfo: customerInfo ? { email: customerInfo.email, phone: customerInfo.phone, address: customerInfo.address } : {},
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    submissions: submissions.map(s => s._id),
    totalAmount,
    unit: submissions[0]?.unit || 'tonne',
    createdBy: userId,
  });

  return await docket.populate('submissions');
};

const deleteDocket = async (id) => {
  const docket = await Docket.findByIdAndDelete(id);
  if (!docket) throw new ErrorResponse('Docket not found', 404);
  return docket;
};

const getPreviewDocket = async (data) => {
  const { customer, startDate, endDate } = data;
  const submissions = await Submission.find({ customer, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });

  if (submissions.length === 0) {
    throw new ErrorResponse('No submissions found for this period', 404);
  }

  // Calculate Total Quantity: sum(amount)
  const totalAmount = submissions.reduce((sum, sub) => sum + sub.amount, 0);
  const customerInfo = await Customer.findOne({ name: new RegExp(`^${customer}$`, 'i') });

  return {
    customer,
    customerInfo: customerInfo ? { email: customerInfo.email, phone: customerInfo.phone, address: customerInfo.address } : {},
    startDate,
    endDate,
    submissions,
    totalAmount,
    unit: submissions[0]?.unit || 'tonne',
    isPreview: true
  };
};

const getDashboardStats = async () => {
  const totalDockets = await Docket.countDocuments();

  // Revenue from all submissions: Σ(item price * quantity)
  const submissions = await Submission.find({}).select('amount order');
  const items = await Item.find({}).select('name price');

  // Create a case-insensitive price map with trimmed keys
  const priceMap = {};
  items.forEach(i => {
    if (i.name) {
      priceMap[i.name.trim().toLowerCase()] = i.price || 0;
    }
  });

  const totalVolumeM3 = submissions.reduce((acc, sub) => {
    if ((sub.unit || 'm³') === 'm³') return acc + (Number(sub.amount) || 0);
    return acc;
  }, 0);

  const totalVolumeTonne = submissions.reduce((acc, sub) => {
    if (sub.unit === 'tonne') return acc + (Number(sub.amount) || 0);
    return acc;
  }, 0);

  const revenue = submissions.reduce((acc, sub) => {
    const orderName = (sub.order || "").trim().toLowerCase();
    const price = priceMap[orderName] || 0;
    const amount = Number(sub.amount) || 0;
    return acc + (amount * price);
  }, 0);

  const customers = await Customer.countDocuments();
  const totalItems = await Item.countDocuments();

  return {
    totalDockets,
    revenue,
    totalVolumeM3,
    totalVolumeTonne,
    customers,
    items: totalItems
  };
};

module.exports = { getDockets, getDocketById, generateDocket, deleteDocket, getPreviewDocket, getDashboardStats };
