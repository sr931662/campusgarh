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
    const { page, limit, role, isActive, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined && isActive !== '') filter.isActive = isActive === 'true';
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
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
    requestRoleChange = catchAsync(async (req, res) => {
    const result = await userService.requestRoleChange(req.user.id, req.body);
    ResponseHandler.success(res, result, 'Role change request submitted', 201);
  });

  getMyRoleRequests = catchAsync(async (req, res) => {
    const requests = await userService.getMyRoleRequests(req.user.id);
    ResponseHandler.success(res, requests);
  });

  getAllRoleRequests = catchAsync(async (req, res) => {
    const requests = await userService.getAllRoleRequests(req.query);
    ResponseHandler.success(res, requests);
  });

  reviewRoleRequest = catchAsync(async (req, res) => {
    const { requestId } = req.params;
    const { action, reviewNote } = req.body;
    const result = await userService.reviewRoleRequest(requestId, req.user.id, action, reviewNote);
    ResponseHandler.success(res, result, `Role request ${action}d`);
  });
  getUser = catchAsync(async (req, res) => {
    const user = await this.userService.getUserById(req.params.userId);
    ResponseHandler.success(res, { user }, 'User fetched');
  });

  adminUpdateUser = catchAsync(async (req, res) => {
    const user = await this.userService.adminUpdateUser(req.params.userId, req.body);
    ResponseHandler.success(res, { user }, 'User updated');
  });

}

module.exports = new UserController();