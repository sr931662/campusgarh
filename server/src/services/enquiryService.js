const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');
const emailService = require('./emailService');


class EnquiryService extends BaseService {
  constructor() {
    super(AdmissionEnquiry);
  }

  // Create enquiry (public)
  async createEnquiry(data) {
    const enquiry = await this.create(data);
    // Student confirmation — fire-and-forget so it never blocks the response
    emailService.sendEnquiryConfirmation(enquiry).catch(() => {});
    // Auto-assign and notify counsellor
    await this.autoAssign(enquiry._id);
    return enquiry;
  }


  // Auto-assign to a counsellor (simple round-robin)
  async autoAssign(enquiryId) {
    const User = require('../models/User');
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('_id name email').lean();
    if (counsellors.length === 0) return;

    // Assign to counsellor with fewest current leads
    const counts = await AdmissionEnquiry.aggregate([
      { $match: { deletedAt: null, assignedTo: { $in: counsellors.map(c => c._id) } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    const counsellor = counsellors.reduce((min, c) =>
      (countMap[c._id.toString()] || 0) < (countMap[min._id.toString()] || 0) ? c : min
    );

    await this.updateById(enquiryId, { assignedTo: counsellor._id });
    const enquiry = await AdmissionEnquiry.findById(enquiryId);
    emailService.sendCounsellorNotification(enquiry, counsellor).catch(() => {});
  }
  async updateEnquiry(enquiryId, updateData) {
    const allowed = ['studentName', 'phone', 'email', 'message', 'preferredCity',
                    'courseInterest', 'collegeInterest', 'budget', 'source'];
    const filtered = {};
    allowed.forEach(f => { if (updateData[f] !== undefined) filtered[f] = updateData[f]; });
    return this.updateById(enquiryId, filtered);
  }

  async deleteEnquiry(enquiryId) {
    const enquiry = await AdmissionEnquiry.findOneAndUpdate(
      { _id: enquiryId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!enquiry) throw new AppError('Enquiry not found', 404);
    return { deleted: true };
  }

  // Assign enquiry manually
  async assignEnquiry(enquiryId, counsellorId) {
    const enquiry = await this.updateById(enquiryId, { assignedTo: counsellorId });
    return enquiry;
  }

  // Add note
  async addNote(enquiryId, noteText, userId) {
    const enquiry = await AdmissionEnquiry.findById(enquiryId);
    if (!enquiry) throw new AppError('Enquiry not found', 404);
    enquiry.notes.push({ text: noteText, createdBy: userId });
    await enquiry.save();
    return enquiry;
  }

  // Update call status & follow-up
  async updateCallStatus(enquiryId, callStatus, followUpDate = null) {
    const update = { callStatus };
    if (followUpDate) update.followUpDate = followUpDate;
    return this.updateById(enquiryId, update);
  }

  // Update conversion status
  async updateConversionStatus(enquiryId, conversionStatus) {
    const update = { conversionStatus };
    if (conversionStatus === 'converted') update.convertedAt = new Date();
    return this.updateById(enquiryId, update);
  }

  // Get enquiries assigned to a counsellor
  async getCounsellorEnquiries(counsellorId, filters = {}, pagination = {}) {
    const page  = parseInt(pagination.page)  || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip  = (page - 1) * limit;

    const query = { assignedTo: counsellorId, deletedAt: null };
    if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;
    if (filters.callStatus)       query.callStatus = filters.callStatus;
    if (filters.followUp)         query.followUpDate = { $lte: new Date() };

    const [data, total] = await Promise.all([
      AdmissionEnquiry.find(query)
        .populate('collegeInterest', 'name city')
        .populate('courseInterest',  'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdmissionEnquiry.countDocuments(query),
    ]);

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  // Get leads imported by a specific partner
  async getPartnerLeads(partnerId, filters = {}, pagination = {}) {
    const query = { importedBy: partnerId, deletedAt: null };
    if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;
    if (filters.callStatus) query.callStatus = filters.callStatus;
    return this.findAll(query, pagination, { createdAt: -1 });
  }

  // Get all enquiries for admin
  async getAllEnquiries(filters = {}, pagination = {}) {
    const page  = parseInt(pagination.page)  || 1;
    const limit = parseInt(pagination.limit) || 20;
    const skip  = (page - 1) * limit;

    const query = { deletedAt: null };
    if (filters.assignedTo)      query.assignedTo = filters.assignedTo;
    if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;
    if (filters.callStatus)       query.callStatus = filters.callStatus;
    if (filters.source)           query.source = filters.source;
    if (filters.search) {
      query.$or = [
        { studentName: { $regex: filters.search, $options: 'i' } },
        { phone:       { $regex: filters.search, $options: 'i' } },
        { email:       { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to)   query.createdAt.$lte = new Date(filters.to);
    }

    const [data, total] = await Promise.all([
      AdmissionEnquiry.find(query)
        .populate('assignedTo',    'name email')
        .populate('collegeInterest', 'name city')
        .populate('courseInterest',  'name')
        .populate('importedBy',      'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdmissionEnquiry.countDocuments(query),
    ]);

    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getEnquiryById(id) {
    const enquiry = await AdmissionEnquiry.findOne({ _id: id, deletedAt: null })
      .populate('assignedTo',    'name email phone')
      .populate('collegeInterest', 'name city state')
      .populate('courseInterest',  'name')
      .populate('importedBy',      'name')
      .populate('notes.createdBy', 'name')
      .lean();
    if (!enquiry) throw new AppError('Enquiry not found', 404);
    return enquiry;
  }

}

module.exports = new EnquiryService();