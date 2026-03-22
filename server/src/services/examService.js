const Exam = require('../models/Exam');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const slugify = require('slugify');

class ExamService extends BaseService {
  constructor() {
    super(Exam);
  }

  async createExam(data) {
    if (!data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.create(data);
  }

  async updateExam(id, data) {
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    return this.updateById(id, data);
  }

  async getBySlug(slug) {
    const exam = await Exam.findOne({ slug, deletedAt: null })
      .populate(
        'participatingColleges',
        'name slug contact collegeType accreditation isVerified'
      )
      .lean();
    if (!exam) throw new AppError('Exam not found', 404);
    return exam;
  }

  async getUpcomingExams() {
    const now = new Date();
    const exams = await Exam.find({
      'importantDates.event': 'Exam Date',
      'importantDates.date': { $gte: now },
      deletedAt: null,
    }).sort({ 'importantDates.date': 1 }).limit(10).lean();
    return exams;
  }

  async searchExams(filters, pagination) {
    const query = { deletedAt: null };
    if (filters.search) query.name = { $regex: filters.search, $options: 'i' };
    if (filters.category) query.category = filters.category;
    if (filters.examLevel) query.examLevel = filters.examLevel;
    if (filters.examMode) query.examMode = filters.examMode;
    if (filters.conductingBody) query.conductingBody = { $regex: filters.conductingBody, $options: 'i' };

    // Upcoming exams only
    if (filters.upcoming === 'true') {
      const now = new Date();
      query['importantDates'] = {
        $elemMatch: { event: 'Exam Date', date: { $gte: now } },
      };
    }

    // Sort
    let sortObj = {};
    if (filters.sort === 'date_asc')  sortObj = { 'importantDates.date': 1, name: 1 };
    else if (filters.sort === 'date_desc') sortObj = { 'importantDates.date': -1, name: 1 };
    else sortObj = { name: 1 };

    return this.findAll(query, pagination, sortObj);
  }
}

module.exports = new ExamService();