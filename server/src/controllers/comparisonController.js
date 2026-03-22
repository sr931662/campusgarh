const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const comparisonService = require('../services/comparisonService');

class ComparisonController {
  // Create comparison
  createComparison = catchAsync(async (req, res) => {
    const { collegeIds, name } = req.body;
    const comparison = await comparisonService.createComparison(req.user.id, collegeIds, name);
    ResponseHandler.success(res, comparison, 'Comparison created', 201);
  });

  // Get user comparisons
  getUserComparisons = catchAsync(async (req, res) => {
    const result = await comparisonService.getUserComparisons(req.user.id);
    ResponseHandler.success(res, result);
  });

  // Get comparison by ID
  getComparison = catchAsync(async (req, res) => {
    const comparison = await comparisonService.getComparisonById(req.params.id);
    // Check if user owns comparison
    if (comparison.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return ResponseHandler.error(res, { message: 'Not authorized' }, 403);
    }
    ResponseHandler.success(res, comparison);
  });

  // Update comparison (add/remove colleges)
  updateComparison = catchAsync(async (req, res) => {
    const { collegeIds } = req.body;
    const comparison = await comparisonService.updateComparison(req.params.id, collegeIds);
    ResponseHandler.success(res, comparison);
  });

  // Delete comparison
  deleteComparison = catchAsync(async (req, res) => {
    const result = await comparisonService.deleteById(req.params.id);
    ResponseHandler.success(res, result);
  });
}

module.exports = new ComparisonController();