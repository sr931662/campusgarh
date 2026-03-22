const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const examService = require('../services/examService');

class ExamController {
  createExam = catchAsync(async (req, res) => {
    const exam = await examService.createExam(req.body);
    ResponseHandler.success(res, exam, 'Exam created', 201);
  });

  getAllExams = catchAsync(async (req, res) => {
    const { page, limit, ...filters } = req.query;
    const result = await examService.searchExams(filters, { page, limit });
    ResponseHandler.success(res, result);
  });

  getExamById = catchAsync(async (req, res) => {
    const exam = await examService.findById(req.params.id);
    ResponseHandler.success(res, exam);
  });

  getExamBySlug = catchAsync(async (req, res) => {
    const exam = await examService.getBySlug(req.params.slug);
    ResponseHandler.success(res, exam);
  });

  updateExam = catchAsync(async (req, res) => {
    const exam = await examService.updateExam(req.params.id, req.body);
    ResponseHandler.success(res, exam, 'Exam updated');
  });

  deleteExam = catchAsync(async (req, res) => {
    const result = await examService.deleteById(req.params.id);
    ResponseHandler.success(res, result, 'Exam deleted');
  });

  getUpcomingExams = catchAsync(async (req, res) => {
    const exams = await examService.getUpcomingExams();
    ResponseHandler.success(res, exams);
  });
}

module.exports = new ExamController();