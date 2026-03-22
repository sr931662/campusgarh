const Comparison = require('../models/Comparison');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');

class ComparisonService extends BaseService {
  constructor() {
    super(Comparison);
  }

  // Create comparison with snapshot
  async createComparison(userId, collegeIds, name = 'My Comparison') {
    // Fetch colleges data to create snapshot
    const College = require('../models/College');
    const colleges = await College.find({ _id: { $in: collegeIds }, deletedAt: null }).lean();
    const snapshot = {
      fees: colleges.map(c => c.fees?.total || 0),
      coursesOffered: [], // will need to fetch from CollegeCourse
      placements: colleges.map(c => c.placementStats?.averagePackage || 0),
      rankings: colleges.map(c => {
        const recent = c.rankings?.find(r => r.year === new Date().getFullYear());
        return recent?.rank || 0;
      }),
      facilities: colleges.map(c => c.facilities || []),
      ratings: [], // can fetch from Review service
    };
    const comparison = await this.create({ user: userId, colleges: collegeIds, snapshot, name });
    return comparison;
  }

  // Get user comparisons
  async getUserComparisons(userId) {
    return this.findAll({ user: userId, deletedAt: null }, { limit: 20 }, { updatedAt: -1 });
  }

  // Get comparison by ID with populated colleges
  async getComparisonById(id) {
    const comparison = await Comparison.findById(id)
      .populate('colleges', 'name slug contact city state placementStats fees rankings')
      .lean();
    if (!comparison) throw new AppError('Comparison not found', 404);
    return comparison;
  }

  // Update comparison (add/remove colleges)
  async updateComparison(id, collegeIds) {
    return this.updateById(id, { colleges: collegeIds });
  }
}

module.exports = new ComparisonService();