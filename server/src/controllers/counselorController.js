const catchAsync   = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const Counselor    = require('../models/Counselor');

exports.getAll = catchAsync(async (req, res) => {
  const counselors = await Counselor.find({ isActive: true }).sort('order');
  ResponseHandler.success(res, counselors);
});

exports.getAllAdmin = catchAsync(async (req, res) => {
  const counselors = await Counselor.find().sort('order');
  ResponseHandler.success(res, counselors);
});

exports.create = catchAsync(async (req, res) => {
  const c = await Counselor.create(req.body);
  ResponseHandler.success(res, c, 'Counselor created', 201);
});

exports.update = catchAsync(async (req, res) => {
  const c = await Counselor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  ResponseHandler.success(res, c, 'Counselor updated');
});

exports.remove = catchAsync(async (req, res) => {
  await Counselor.findByIdAndDelete(req.params.id);
  ResponseHandler.success(res, null, 'Counselor deleted');
});
