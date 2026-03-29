const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const comparisonService = require('../services/comparisonService');

class ComparisonController {
  createComparison = catchAsync(async (req, res) => {
    const { type = 'college', collegeIds, courseIds, examIds, name } = req.body;
    const itemIds = type === 'college' ? collegeIds : type === 'course' ? courseIds : examIds;
    const comparison = await comparisonService.createComparison(req.user.id, type, itemIds || [], name);
    ResponseHandler.success(res, comparison, 'Comparison created', 201);
  });

  getUserComparisons = catchAsync(async (req, res) => {
    const result = await comparisonService.getUserComparisons(req.user.id);
    ResponseHandler.success(res, result);
  });

  getComparison = catchAsync(async (req, res) => {
    const comparison = await comparisonService.getComparisonById(req.params.id);
    if (comparison.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return ResponseHandler.error(res, { message: 'Not authorized' }, 403);
    }
    ResponseHandler.success(res, comparison);
  });

  updateComparison = catchAsync(async (req, res) => {
    const { type = 'college', collegeIds, courseIds, examIds } = req.body;
    const itemIds = type === 'college' ? collegeIds : type === 'course' ? courseIds : examIds;
    const comparison = await comparisonService.updateComparison(req.params.id, type, itemIds || []);
    ResponseHandler.success(res, comparison);
  });

  deleteComparison = catchAsync(async (req, res) => {
    const result = await comparisonService.deleteById(req.params.id);
    ResponseHandler.success(res, result);
  });
}

module.exports = new ComparisonController();
