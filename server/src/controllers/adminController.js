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

    // List all counsellors (for assign dropdown)
  getCounsellors = catchAsync(async (_req, res) => {
    const counsellors = await userService.model.find({ role: 'counsellor', isActive: true, deletedAt: null })
      .select('_id name email')
      .sort({ name: 1 })
      .lean();
    ResponseHandler.success(res, counsellors);
  });

  // Analytics breakdown
  getAnalytics = catchAsync(async (req, res) => {
    const AdmissionEnquiry = enquiryService.model;
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday   = new Date(); endOfToday.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      conversionBreakdown, callStatusBreakdown, sourceBreakdown,
      todayFollowUps, thisMonthEnquiries,
      totalUsers, totalColleges, totalCourses, totalEnquiries, convertedCount,
    ] = await Promise.all([
      AdmissionEnquiry.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$conversionStatus', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AdmissionEnquiry.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$callStatus',       count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AdmissionEnquiry.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$source',           count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      AdmissionEnquiry.countDocuments({ deletedAt: null, followUpDate: { $gte: startOfToday, $lte: endOfToday } }),
      AdmissionEnquiry.countDocuments({ deletedAt: null, createdAt: { $gte: startOfMonth } }),
      userService.model.countDocuments({ deletedAt: null }),
      collegeService.model.countDocuments({ deletedAt: null }),
      courseService.model.countDocuments({ deletedAt: null }),
      AdmissionEnquiry.countDocuments({ deletedAt: null }),
      AdmissionEnquiry.countDocuments({ deletedAt: null, conversionStatus: 'converted' }),
    ]);

    ResponseHandler.success(res, {
      conversionBreakdown,
      callStatusBreakdown,
      sourceBreakdown,
      todayFollowUps,
      thisMonthEnquiries,
      totals: { totalUsers, totalColleges, totalCourses, totalEnquiries, convertedCount },
    });
  });

}

module.exports = new AdminController();