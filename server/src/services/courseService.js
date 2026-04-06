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

    // NLP abbreviation map — expands common short-forms to match full course names
    const ABBR_MAP = {
      'btech': 'technology', 'b.tech': 'technology', 'b tech': 'technology',
      'mtech': 'technology', 'm.tech': 'technology', 'm tech': 'technology',
      'be': 'engineering',   'b.e': 'engineering',
      'me': 'engineering',   'm.e': 'engineering',
      'mba': 'business administration',
      'bba': 'business administration',
      'mca': 'computer applications',
      'bca': 'computer applications',
      'bsc': 'science',  'b.sc': 'science',
      'msc': 'science',  'm.sc': 'science',
      'bcom': 'commerce', 'b.com': 'commerce',
      'mcom': 'commerce', 'm.com': 'commerce',
      'llb': 'law', 'll.b': 'law',
      'llm': 'law', 'll.m': 'law',
      'mbbs': 'medicine',
      'bds': 'dental',
      'barch': 'architecture', 'b.arch': 'architecture',
      'bpharm': 'pharmacy',    'b.pharm': 'pharmacy',
      'phd': 'philosophy',
    };

    if (filters.search) {
      const raw = filters.search.trim();
      const esc = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orConditions = [
        { name:        { $regex: esc, $options: 'i' } },
        { discipline:  { $regex: esc, $options: 'i' } },
        { description: { $regex: esc, $options: 'i' } },
      ];
      // Expand abbreviation if found (e.g. "B.Tech" → also search "technology")
      const expanded = ABBR_MAP[raw.toLowerCase()];
      if (expanded) {
        const expEsc = expanded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        orConditions.push(
          { name:       { $regex: expEsc, $options: 'i' } },
          { discipline: { $regex: expEsc, $options: 'i' } },
        );
      }
      query.$or = orConditions;
    }
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