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
  getCollegeDetailedAnalysis = catchAsync(async (req, res) => {
    const { collegeId, courseId, examId, rank, percentile, cgpa, percentage, category } = req.query;
    const result = await predictorService.getCollegeDetailedAnalysis({
      collegeId, courseId, examId, rank, percentile, cgpa, percentage, category,
    });
    if (!result) return ResponseHandler.error(res, { message: 'College-course combination not found' }, 404);
    ResponseHandler.success(res, result);
  });

  predictCollegesForCourse = catchAsync(async (req, res) => {
    const results = await predictorService.predictCollegesForCourse(req.query);
    ResponseHandler.success(res, results, 'College predictions for course generated');
  });

  getExamCollegeMap = catchAsync(async (req, res) => {
    const results = await predictorService.getExamCollegeMap(req.query);
    ResponseHandler.success(res, results, 'Exam-college map generated');
  });

  analyzeResults = catchAsync(async (req, res) => {
    const ollamaService = require('../services/ollamaService');
    const { type, userProfile, results } = req.body;
    if (!type || !results) {
      return ResponseHandler.error(res, { message: 'type and results are required' }, 400);
    }
    let prompt;
    const profile = userProfile || {};
    if      (type === 'colleges')       prompt = ollamaService.buildCollegePredictionPrompt(profile, results);
    else if (type === 'college-detail') prompt = ollamaService.buildDetailedAnalysisPrompt(profile, results);
    else if (type === 'courses')        prompt = ollamaService.buildCoursePredictionPrompt(profile, results);
    else if (type === 'exams')          prompt = ollamaService.buildExamPredictionPrompt(profile, results);
    else return ResponseHandler.error(res, { message: 'Invalid type. Use: colleges, college-detail, courses, exams' }, 400);

    const analysis = await ollamaService.generateAnalysis(prompt);
    ResponseHandler.success(res, { analysis }, 'AI analysis generated');
  });


}

module.exports = new PredictorController();
