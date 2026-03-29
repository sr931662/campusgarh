const catchAsync       = require('../utils/catchAsync');
const ResponseHandler  = require('../utils/responseHandler');
const predictorService = require('../services/predictorService');

class PredictorController {
  predictColleges = catchAsync(async (req, res) => {
    const results = await predictorService.predictColleges(req.query);
    ResponseHandler.success(res, results, 'College predictions generated');
  });

  predictCourses = catchAsync(async (req, res) => {
    const results = await predictorService.predictCourses(req.query);
    ResponseHandler.success(res, results, 'Course predictions generated');
  });

  predictExams = catchAsync(async (req, res) => {
    const results = await predictorService.predictExams(req.query);
    ResponseHandler.success(res, results, 'Exam predictions generated');
  });
}

module.exports = new PredictorController();
