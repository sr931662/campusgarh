const Comparison = require('../models/Comparison');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');

class ComparisonService extends BaseService {
  constructor() { super(Comparison); }

  async createComparison(userId, type = 'college', itemIds = [], name = 'My Comparison') {
    const payload = { user: userId, type, name, colleges: [], courses: [], exams: [], snapshot: {} };

    if (type === 'college') {
      const College = require('../models/College');
      const items = await College.find({ _id: { $in: itemIds }, deletedAt: null }).lean();
      payload.colleges = itemIds;
      payload.snapshot = {
        fees:       items.map(c => c.fees?.total || 0),
        placements: items.map(c => c.placementStats?.averagePackage || 0),
        rankings:   items.map(c => c.rankings?.find(r => r.year === new Date().getFullYear())?.rank || 0),
      };
    } else if (type === 'course') {
      payload.courses = itemIds;
    } else if (type === 'exam') {
      payload.exams = itemIds;
    }

    return this.create(payload);
  }

  async getUserComparisons(userId) {
    return this.findAll({ user: userId, deletedAt: null }, { limit: 20 }, { updatedAt: -1 });
  }

  async getComparisonById(id) {
    const comparison = await Comparison.findById(id)
      .populate('colleges', 'name slug contact accreditation placementStats fees campusInfo hostel')
      .populate('courses',  'name category discipline duration mode feeRange eligibility admissionType')
      .populate('exams',    'name category examLevel conductingBody registrationFee examMode frequency officialWebsite')
      .lean();
    if (!comparison) throw new AppError('Comparison not found', 404);
    return comparison;
  }

  async updateComparison(id, type, itemIds) {
    const update = { type, colleges: [], courses: [], exams: [] };
    if (type === 'college') update.colleges = itemIds;
    else if (type === 'course') update.courses = itemIds;
    else if (type === 'exam') update.exams = itemIds;
    return this.updateById(id, update);
  }
}

module.exports = new ComparisonService();
