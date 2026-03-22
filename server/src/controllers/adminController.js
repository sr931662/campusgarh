const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const userService = require('../services/userService');
const collegeService = require('../services/collegeService');
const courseService = require('../services/courseService');
const examService = require('../services/examService');
const reviewService = require('../services/reviewService');
const blogService = require('../services/blogService');
const enquiryService = require('../services/enquiryService');

class AdminController {
  // Dashboard stats
  getDashboardStats = catchAsync(async (req, res) => {
    const [totalUsers, totalColleges, totalCourses, totalEnquiries, pendingReviews] = await Promise.all([
      userService.model.countDocuments({ deletedAt: null }),
      collegeService.model.countDocuments({ deletedAt: null }),
      courseService.model.countDocuments({ deletedAt: null }),
      enquiryService.model.countDocuments({ deletedAt: null }),
      reviewService.model.countDocuments({ status: 'pending', deletedAt: null }),
    ]);
    ResponseHandler.success(res, {
      totalUsers,
      totalColleges,
      totalCourses,
      totalEnquiries,
      pendingReviews,
    });
  });

  // Bulk delete colleges (soft delete)
  bulkDeleteColleges = catchAsync(async (req, res) => {
    const { collegeIds } = req.body;
    const operations = collegeIds.map((id) => ({
      updateOne: { filter: { _id: id }, update: { $set: { deletedAt: new Date() } } },
    }));
    await collegeService.bulkUpdate(operations);
    ResponseHandler.success(res, null, 'Colleges deleted');
  });

  // ... other admin operations can be added
}

module.exports = new AdminController();