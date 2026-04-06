const College = require('../models/College');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const Facility = require('../models/Facility');      // ✅ Required for facilities population
const Media = require('../models/Media');            // ✅ Required for images/videos
const Course = require('../models/Course');          // ✅ Required for cutoffs.course
const Exam = require('../models/Exam');              // ✅ Required for cutoffs.exam
const slugify = require('slugify');

class CollegeService extends BaseService {
  constructor() {
    super(College);
  }

  async createCollege(data) {
    if (!data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
    // Ensure nested objects exist
    data.admissionProcess = data.admissionProcess || {};
    data.placementStats = data.placementStats || {};
    data.hostel = data.hostel || {};
    data.campusInfo = data.campusInfo || {};
    data.rankings = data.rankings || [];
    data.scholarships = data.scholarships || [];
    data.cutoffs = data.cutoffs || [];
    data.yearWisePlacements = data.yearWisePlacements || [];
    return this.create(data);
  }

  // Upsert: create if slug doesn't exist, update if it does.
  // Used by bulk import so re-importing updates existing colleges (e.g. sets logoUrl).
  async upsertCollege(data) {
    if (!data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
    data.admissionProcess = data.admissionProcess || {};
    data.placementStats   = data.placementStats   || {};
    data.hostel           = data.hostel           || {};
    data.campusInfo       = data.campusInfo       || {};
    data.rankings         = data.rankings         || [];
    data.scholarships     = data.scholarships     || [];
    data.cutoffs          = data.cutoffs          || [];
    data.yearWisePlacements = data.yearWisePlacements || [];

    return College.findOneAndUpdate(
      { slug: data.slug },
      { $set: data },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
  }

  async updateCollege(id, data) {
    if (data.name && !data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
    // Support raw mongo operators like $push
    if (Object.keys(data).some(k => k.startsWith('$'))) {
      return College.findByIdAndUpdate(id, data, { new: true, runValidators: false }).lean();
    }
    return this.updateById(id, data);
  }


  async getBySlug(slug) {
    try {
      // Find college by slug
      const college = await College.findOne({ slug, deletedAt: null })
        .populate({
          path: 'facilities',
          match: { deletedAt: null },
          select: 'name description icon'
        })
        .populate({
          path: 'images',
          match: { deletedAt: null },
          select: 'url alt type'
        })
        .populate({
          path: 'videos',
          match: { deletedAt: null },
          select: 'url alt type'
        })
        .populate({
          path: 'cutoffs.course',
          model: 'Course',
          match: { deletedAt: null },
          select: 'name slug'
        })
        .populate({
          path: 'cutoffs.exam',
          model: 'Exam',
          match: { deletedAt: null },
          select: 'name slug'
        })
        .lean();

      if (!college) throw new AppError('College not found', 404);

      // Fetch courses offered via CollegeCourse junction
      const CollegeCourse = require('../models/CollegeCourse');
      const mappings = await CollegeCourse.find({
        college: college._id,
        isActive: true,
        deletedAt: null
      })
        .populate({
          path: 'course',
          match: { deletedAt: null },
          select: 'name slug category discipline duration mode specializations feeRange'
        })
        .lean();

      college.courses = mappings
        .map(m => m.course)
        .filter(course => course !== null && course !== undefined);

      // Ensure all sub‑documents are present (even if empty)
      college.admissionProcess = college.admissionProcess || {};
      college.placementStats = college.placementStats || {};
      college.hostel = college.hostel || {};
      college.campusInfo = college.campusInfo || {};
      college.rankings = college.rankings || [];
      college.scholarships = college.scholarships || [];
      college.cutoffs = college.cutoffs || [];
      college.yearWisePlacements = college.yearWisePlacements || [];

      return college;
    } catch (error) {
      console.error('Error in getBySlug:', error);
      throw error;
    }
  }

  async searchColleges(filters, pagination = {}, sort = {}) {
    const query = { deletedAt: null };

    // NLP abbreviation map for college name expansion
    const COLLEGE_ABBR_MAP = {
      'iit':   'indian institute of technology',
      'nit':   'national institute of technology',
      'iiit':  'indian institute of information technology',
      'iim':   'indian institute of management',
      'aiims': 'all india institute of medical sciences',
      'bits':  'birla institute',
      'nlu':   'national law university',
      'du':    'delhi university',
      'bu':    'bangalore university',
      'mu':    'mumbai university',
    };

    if (filters.search) {
      const raw = filters.search.trim();
      const terms = raw.split(/\s+/)
        .filter(Boolean)
        .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

      const makeOr = (t) => [
        { name:             { $regex: t, $options: 'i' } },
        { shortName:        { $regex: t, $options: 'i' } },
        { 'contact.city':  { $regex: t, $options: 'i' } },
        { 'contact.state': { $regex: t, $options: 'i' } },
        { description:     { $regex: t, $options: 'i' } },
      ];

      const expanded = COLLEGE_ABBR_MAP[raw.toLowerCase()];
      if (expanded) {
        const expEsc = expanded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          ...makeOr(terms[0]),
          { name:      { $regex: expEsc, $options: 'i' } },
          { shortName: { $regex: expEsc, $options: 'i' } },
        ];
      } else if (terms.length === 1) {
        query.$or = makeOr(terms[0]);
      } else {
        query.$and = (query.$and || []).concat(
          terms.map(t => ({ $or: makeOr(t) }))
        );
      }
    }

    if (filters.city) query['contact.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.state) query['contact.state'] = { $regex: filters.state, $options: 'i' };
    if (filters.type) query.collegeType = filters.type;
    if (filters.fundingType) query.fundingType = filters.fundingType;
    if (filters.ranking) query['rankings.rank'] = { $lte: parseInt(filters.ranking) };
    if (filters.feesMin || filters.feesMax) {
      query['fees.total'] = {};
      if (filters.feesMin) query['fees.total'].$gte = parseInt(filters.feesMin);
      if (filters.feesMax) query['fees.total'].$lte = parseInt(filters.feesMax);
    }
    if (filters.naacGrade) query['accreditation.naacGrade'] = filters.naacGrade;
    if (filters.nbaStatus === 'true') query['accreditation.nbaStatus'] = true;
    if (filters.approvedBy) {
      const bodies = filters.approvedBy.split(',').map(s => s.trim()).filter(Boolean);
      if (bodies.length) query.approvedBy = { $all: bodies };
    }
    if (filters.campusType) query['campusInfo.campusType'] = filters.campusType;
    if (filters.minPlacement) query['placementStats.placementPercentage'] = { $gte: Number(filters.minPlacement) };
    if (filters.minPackage) query['placementStats.averagePackage'] = { $gte: Number(filters.minPackage) };
    if (filters.admissionMode) query['admissionProcess.mode'] = filters.admissionMode;
    if (filters.isVerified === 'true') query.isVerified = true;
    if (filters.featured === 'true') query.featured = true;

    let sortObj = {};
    if (filters.sort === 'ranking') sortObj = { 'accreditation.nirfRank': 1, name: 1 };
    else if (filters.sort === 'fees_asc') sortObj = { 'fees.total': 1, name: 1 };
    else if (filters.sort === 'fees_desc') sortObj = { 'fees.total': -1, name: 1 };
    else if (filters.sort === 'placement') sortObj = { 'placementStats.placementPercentage': -1, name: 1 };
    else if (filters.sort === 'package') sortObj = { 'placementStats.averagePackage': -1, name: 1 };
    else sortObj = { 'accreditation.nirfRank': 1, name: 1 };

    return this.findAll(query, pagination, sortObj);
  }

  async getCollegesByCourse(courseId, pagination) {
    const CollegeCourse = require('../models/CollegeCourse');
    const collegeIds = await CollegeCourse.find({ course: courseId, isActive: true }).distinct('college');
    const query = { _id: { $in: collegeIds }, deletedAt: null };
    return this.findAll(query, pagination, { 'placementStats.placementPercentage': -1 });
  }

  async getFeatured(pagination = {}) {
    const query = { featured: true, deletedAt: null };
    return this.findAll(query, pagination, { views: -1 });
  }
  
  async getOnline(pagination = {}) {
    const query = { isOnline: true, deletedAt: null };
    return this.findAll(query, pagination, { views: -1 });
  }


  async incrementViews(id) {
    await College.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }
}

module.exports = new CollegeService();