import Newsletter from '../models/Newsletter.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import ResponseHandler from '../utils/ResponseHandler.js';

export const subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Email is required', 400));

  const existing = await Newsletter.findOne({ email });

  if (existing) {
    if (existing.isActive) {
      return next(new AppError('This email is already subscribed', 409));
    }
    // Re-activate if previously unsubscribed
    existing.isActive = true;
    existing.subscribedAt = new Date();
    await existing.save();
    return ResponseHandler.success(res, 200, 'Subscribed successfully', null);
  }

  await Newsletter.create({ email });
  ResponseHandler.success(res, 201, 'Subscribed successfully', null);
});

export const unsubscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  const sub = await Newsletter.findOne({ email });
  if (!sub) return next(new AppError('Email not found', 404));

  sub.isActive = false;
  await sub.save();
  ResponseHandler.success(res, 200, 'Unsubscribed successfully', null);
});

// Admin only
export const getAllSubscribers = catchAsync(async (req, res) => {
  const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
  ResponseHandler.success(res, 200, 'Subscribers fetched', subscribers);
});
