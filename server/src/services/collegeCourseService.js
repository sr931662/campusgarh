const CollegeCourse = require('../models/CollegeCourse');
const BaseService = require('./baseService');

class CollegeCourseService extends BaseService {
  constructor() {
    super(CollegeCourse);
  }

  async getCoursesForCollege(collegeId, filters = {}) {
    const query = { college: collegeId, isActive: true, deletedAt: null };
    if (filters.courseId) query.course = filters.courseId;
    return CollegeCourse.find(query)
      .populate('course', 'name slug category discipline duration mode specializations feeRange')
      .populate('entranceExamRequirement', 'name slug category')
      .lean();
  }

  async getCollegesForCourse(courseId, filters = {}) {
    const query = { course: courseId, isActive: true, deletedAt: null };
    if (filters.collegeId) query.college = filters.collegeId;
    return CollegeCourse.find(query)
      .populate('college', 'name slug contact collegeType accreditation fees placementStats isVerified rankings')
      .populate('entranceExamRequirement', 'name slug category')
      .lean();
  }

  async getCollegesForExam(examId) {
    return CollegeCourse.find({
      entranceExamRequirement: examId,
      isActive: true,
      deletedAt: null,
    })
      .populate('college', 'name slug contact collegeType accreditation')
      .populate('course', 'name slug category discipline')
      .lean();
  }

  async createMapping(data) {
    return CollegeCourse.create(data);
  }

  async updateMapping(id, data) {
    return this.updateById(id, data);
  }

  async deleteMapping(id) {
    return CollegeCourse.findByIdAndDelete(id);
  }

  async bulkUpsert(mappings) {
    const operations = mappings.map(mapping => ({
      updateOne: {
        filter: { college: mapping.college, course: mapping.course },
        update: { $set: mapping },
        upsert: true,
      },
    }));
    return this.bulkUpdate(operations);
  }
}

module.exports = new CollegeCourseService();
