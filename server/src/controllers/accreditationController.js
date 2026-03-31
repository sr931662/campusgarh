const AccreditationBody = require('../models/AccreditationBody');
const AppError  = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = catchAsync(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  const bodies = await AccreditationBody.find(filter).sort('order abbr');
  res.json({ status: 'success', data: bodies });
});

exports.create = catchAsync(async (req, res) => {
  const body = await AccreditationBody.create(req.body);
  res.status(201).json({ status: 'success', data: body });
});

exports.update = catchAsync(async (req, res) => {
  const body = await AccreditationBody.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!body) throw new AppError('Not found', 404);
  res.json({ status: 'success', data: body });
});

exports.remove = catchAsync(async (req, res) => {
  const body = await AccreditationBody.findByIdAndDelete(req.params.id);
  if (!body) throw new AppError('Not found', 404);
  res.json({ status: 'success', data: null });
});
