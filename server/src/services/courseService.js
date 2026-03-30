const Course = require('../models/Course');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const slugify = require('slugify');

class CourseService extends BaseService {
  constructor() {
    super(Course);
  }

  async createCourse(data) {
    if (!data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.create(data);
  }

  async updateCourse(id, data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.updateById(id, data);
  }

  async getBySlug(slug) {
    const course = await Course.findOne({ slug, deletedAt: null })
      .populate('entranceExamRequirements', 'name slug category registrationFee officialWebsite')
      .lean();
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async searchCourses(filters, pagination) {
    const query = { deletedAt: null, isActive: { $ne: false } };

    if (filters.search)   query.name = { $regex: filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (filters.category) query.category = filters.category;
    if (filters.mode)     query.mode = filters.mode;
    if (filters.discipline) {
      const escaped = filters.discipline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.discipline = { $regex: escaped, $options: 'i' };
    }
    if (filters.admissionType) query.admissionType = filters.admissionType;

    if (filters.feesMin || filters.feesMax) {
      query['feeRange.min'] = {};
      if (filters.feesMin) query['feeRange.min'].$gte = parseInt(filters.feesMin);
      if (filters.feesMax) query['feeRange.min'].$lte = parseInt(filters.feesMax);
    }

    if (filters.minSalary) {
      query['careerProspects.averageStartingSalary'] = { $gte: Number(filters.minSalary) };
    }

    if (filters.examId) {
      query.entranceExamRequirements = filters.examId;
    }

    let sortObj = { name: 1 };
    if (filters.sort === 'fees_asc')  sortObj = { 'feeRange.min': 1,  name: 1 };
    if (filters.sort === 'fees_desc') sortObj = { 'feeRange.max': -1, name: 1 };
    if (filters.sort === 'salary')    sortObj = { 'careerProspects.averageStartingSalary': -1, name: 1 };

    return this.findAll(query, pagination, sortObj);
  }

}

module.exports = new CourseService();