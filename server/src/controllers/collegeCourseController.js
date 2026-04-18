// src/controllers/collegeCourseController.js
const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const collegeCourseService = require('../services/collegeCourseService');

class CollegeCourseController {
  getCoursesForCollege = catchAsync(async (req, res) => {
    const { collegeId } = req.params;
    const courses = await collegeCourseService.getCoursesForCollege(collegeId);
    ResponseHandler.success(res, courses);
  });

  getCollegesForCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const colleges = await collegeCourseService.getCollegesForCourse(courseId);
    ResponseHandler.success(res, colleges);
  });

  getCollegesForExam = catchAsync(async (req, res) => {
    const { examId } = req.params;
    const mappings = await collegeCourseService.getCollegesForExam(examId);
    ResponseHandler.success(res, mappings);
  });

  createMapping = catchAsync(async (req, res) => {
    const mapping = await collegeCourseService.createMapping(req.body);
    ResponseHandler.success(res, mapping, 'Mapping created', 201);
  });

  updateMapping = catchAsync(async (req, res) => {
    const { mappingId } = req.params;
    const mapping = await collegeCourseService.updateMapping(mappingId, req.body);
    ResponseHandler.success(res, mapping);
  });

  deleteMapping = catchAsync(async (req, res) => {
    await collegeCourseService.deleteMapping(req.params.mappingId);
    ResponseHandler.success(res, null, 'Mapping deleted');
  });
}

module.exports = new CollegeCourseController();