const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const userService = require('../services/userService');

class UserController {
  // Get current user profile
  getProfile = catchAsync(async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    ResponseHandler.success(res, user);
  });

  // Update profile
  updateProfile = catchAsync(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    ResponseHandler.success(res, user, 'Profile updated');
  });

  // Toggle saved college
  toggleSavedCollege = catchAsync(async (req, res) => {
    const { collegeId } = req.params;
    const result = await userService.toggleSavedCollege(req.user.id, collegeId);
    ResponseHandler.success(res, result);
  });

  // Toggle saved course
  toggleSavedCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const result = await userService.toggleSavedCourse(req.user.id, courseId);
    ResponseHandler.success(res, result);
  });

  // Update academic details
  updateAcademicDetails = catchAsync(async (req, res) => {
    const user = await userService.updateAcademicDetails(req.user.id, req.body);
    ResponseHandler.success(res, user);
  });

  // Update preferences
  updatePreferences = catchAsync(async (req, res) => {
    const user = await userService.updatePreferences(req.user.id, req.body);
    ResponseHandler.success(res, user);
  });

  // Admin: get all users
  getAllUsers = catchAsync(async (req, res) => {
    const { page, limit, role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const result = await userService.getAllUsers(filter, { page, limit });
    ResponseHandler.success(res, result);
  });

  // Admin: toggle user active status
  toggleActiveStatus = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;
    const user = await userService.toggleActiveStatus(userId, isActive);
    ResponseHandler.success(res, user);
  });

  // Admin: assign role
  assignRole = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await userService.assignRole(userId, role);
    ResponseHandler.success(res, user);
  });
}

module.exports = new UserController();