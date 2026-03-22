const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const courseService = require('../services/courseService');

class CourseController {
  createCourse = catchAsync(async (req, res) => {
    const course = await courseService.createCourse(req.body);
    ResponseHandler.success(res, course, 'Course created', 201);
  });

  getAllCourses = catchAsync(async (req, res) => {
    const { page, limit, examId, ...filters } = req.query;
    if (examId) {
      filters.entranceExamRequirements = examId;
    }
    const result = await courseService.searchCourses(filters, { page, limit });
    ResponseHandler.success(res, result);
  });

  getCourseById = catchAsync(async (req, res) => {
    const course = await courseService.findById(req.params.id);
    ResponseHandler.success(res, course);
  });

  getCourseBySlug = catchAsync(async (req, res) => {
    const course = await courseService.getBySlug(req.params.slug);
    ResponseHandler.success(res, course);
  });

  updateCourse = catchAsync(async (req, res) => {
    const course = await courseService.updateCourse(req.params.id, req.body);
    ResponseHandler.success(res, course, 'Course updated');
  });

  deleteCourse = catchAsync(async (req, res) => {
    const result = await courseService.deleteById(req.params.id);
    ResponseHandler.success(res, result, 'Course deleted');
  });
}

module.exports = new CourseController();