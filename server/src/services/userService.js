const User = require('../models/User');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const RoleChangeRequest = require('../models/RoleChangeRequest');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  // Get user profile with populated references
  async getProfile(userId) {
    const user = await User.findById(userId)
      .populate('savedColleges', 'name slug city state')
      .populate('savedCourses', 'name category')
      .populate('savedComparisons', 'name colleges')
      .lean();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // Update profile (excluding password, role)
  async updateProfile(userId, updateData) {
    // Remove fields that cannot be updated directly
    const allowedUpdates = [
      'name',
      'phone',
      'profilePicture',
      'academicBackground',
      'preferredCourses',
      'preferredCities',
      'preferredStates',
      'budgetRange',
      'entranceExamsAttempted',
      'interests',
    ];
    const filteredData = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) filteredData[key] = updateData[key];
    }
    const user = await this.updateById(userId, filteredData);
    return user;
  }

  // Add/Remove saved college
  async toggleSavedCollege(userId, collegeId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const index = user.savedColleges.indexOf(collegeId);
    if (index === -1) {
      user.savedColleges.push(collegeId);
    } else {
      user.savedColleges.splice(index, 1);
    }
    await user.save();
    return { saved: index === -1 };
  }

  // Similar for courses, comparisons
  async toggleSavedCourse(userId, courseId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const index = user.savedCourses.indexOf(courseId);
    if (index === -1) {
      user.savedCourses.push(courseId);
    } else {
      user.savedCourses.splice(index, 1);
    }
    await user.save();
    return { saved: index === -1 };
  }

  // Update academic details
  async updateAcademicDetails(userId, academicData) {
    const user = await this.updateById(userId, { academicBackground: academicData });
    return user;
  }

  // Update preferences
  async updatePreferences(userId, preferences) {
    const allowedPreferences = ['preferredCourses', 'preferredCities', 'preferredStates', 'budgetRange', 'interests'];
    const filteredPreferences = {};
    for (const key of allowedPreferences) {
      if (preferences[key] !== undefined) filteredPreferences[key] = preferences[key];
    }
    const user = await this.updateById(userId, filteredPreferences);
    return user;
  }

  // Get all users with role filtering (admin only)
  async getAllUsers(filter = {}, pagination = {}) {
    return this.findAll(filter, pagination, { createdAt: -1 });
  }

  // Deactivate/activate user (admin)
  async toggleActiveStatus(userId, isActive) {
    const user = await this.updateById(userId, { isActive });
    return user;
  }

  // Assign role (admin)
  async assignRole(userId, role) {
    const user = await this.updateById(userId, { role });
    return user;
  }

    async requestRoleChange(userId, { requestedRole, reason }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (user.role === requestedRole) throw new AppError('You already have this role', 400);
    const allowed = ['student', 'counsellor', 'institution_rep'];
    if (!allowed.includes(requestedRole)) throw new AppError('Cannot request this role', 400);
    const existing = await RoleChangeRequest.findOne({ user: userId, status: 'pending' });
    if (existing) throw new AppError('You already have a pending role change request', 400);
    return RoleChangeRequest.create({ user: userId, currentRole: user.role, requestedRole, reason });
  }

  async getMyRoleRequests(userId) {
    return RoleChangeRequest.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async getAllRoleRequests({ status, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      RoleChangeRequest.find(filter)
        .populate('user', 'name email role')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      RoleChangeRequest.countDocuments(filter),
    ]);
    return { data, pagination: { total, page: +page, limit: +limit } };
  }

  async reviewRoleRequest(requestId, adminId, action, reviewNote) {
    const request = await RoleChangeRequest.findById(requestId).populate('user');
    if (!request) throw new AppError('Request not found', 404);
    if (request.status !== 'pending') throw new AppError('Request already reviewed', 400);
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.reviewedBy = adminId;
    request.reviewNote = reviewNote || '';
    request.reviewedAt = new Date();
    await request.save();
    if (action === 'approve') await User.findByIdAndUpdate(request.user._id, { role: request.requestedRole });
    return request;
  }

}

module.exports = new UserService();