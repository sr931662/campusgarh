const PartnerApplication = require('../models/PartnerApplication');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.apply = catchAsync(async (req, res) => {
  const { name, email, phone, city, type, experience, studentsPerMonth, message } = req.body;
  if (!name || !email || !phone || !city || !type) {
    throw new AppError('name, email, phone, city and type are required', 400);
  }
  const app = await PartnerApplication.create({ name, email, phone, city, type, experience, studentsPerMonth, message });
  res.status(201).json({ status: 'success', message: 'Application submitted successfully', data: app });
});

exports.getAll = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    PartnerApplication.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    PartnerApplication.countDocuments(filter),
  ]);
  res.json({ status: 'success', data: { data: applications, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
});

exports.updateStatus = catchAsync(async (req, res) => {
  const app = await PartnerApplication.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, adminNote: req.body.adminNote },
    { new: true, runValidators: true }
  );
  if (!app) throw new AppError('Application not found', 404);
  res.json({ status: 'success', data: app });
});
