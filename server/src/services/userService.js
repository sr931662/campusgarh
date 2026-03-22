const User = require('../models/User');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');

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
}

module.exports = new UserService();