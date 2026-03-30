const Newsletter = require('../models/Newsletter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ResponseHandler = require('../utils/responseHandler');

const subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Email is required', 400));

  const existing = await Newsletter.findOne({ email });

  if (existing) {
    if (existing.isActive) {
      return next(new AppError('This email is already subscribed', 409));
    }
    existing.isActive = true;
    existing.subscribedAt = new Date();
    await existing.save();
    return ResponseHandler.success(res, 200, 'Subscribed successfully', null);
  }

  await Newsletter.create({ email });
  ResponseHandler.success(res, 201, 'Subscribed successfully', null);
});

const unsubscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  const sub = await Newsletter.findOne({ email });
  if (!sub) return next(new AppError('Email not found', 404));

  sub.isActive = false;
  await sub.save();
  ResponseHandler.success(res, 200, 'Unsubscribed successfully', null);
});

const getAllSubscribers = catchAsync(async (_req, res) => {
  const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
  ResponseHandler.success(res, 200, 'Subscribers fetched', subscribers);
});

module.exports = { subscribe, unsubscribe, getAllSubscribers };
