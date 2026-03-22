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

  updateMapping = catchAsync(async (req, res) => {
    const { mappingId } = req.params;
    const mapping = await collegeCourseService.updateMapping(mappingId, req.body);
    ResponseHandler.success(res, mapping);
  });
}

module.exports = new CollegeCourseController();