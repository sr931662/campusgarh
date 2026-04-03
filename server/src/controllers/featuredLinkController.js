const FeaturedLink = require('../models/FeaturedLink');
const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');

// GET /featured-links  (public — returns only active; admin can pass ?all=true)
exports.getAll = catchAsync(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  const links = await FeaturedLink.find(filter).sort('order title');
  res.json({ status: 'success', data: links });
});

// POST /featured-links  (admin)
exports.create = catchAsync(async (req, res) => {
  const link = await FeaturedLink.create(req.body);
  res.status(201).json({ status: 'success', data: link });
});

// PATCH /featured-links/:id  (admin)
exports.update = catchAsync(async (req, res) => {
  const link = await FeaturedLink.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!link) throw new AppError('Not found', 404);
  res.json({ status: 'success', data: link });
});

// DELETE /featured-links/:id  (admin)
exports.remove = catchAsync(async (req, res) => {
  const link = await FeaturedLink.findByIdAndDelete(req.params.id);
  if (!link) throw new AppError('Not found', 404);
  res.json({ status: 'success', data: null });
});
