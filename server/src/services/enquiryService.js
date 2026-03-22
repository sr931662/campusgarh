const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const BaseService = require('./baseService');
const AppError = require('../utils/AppError');

class EnquiryService extends BaseService {
  constructor() {
    super(AdmissionEnquiry);
  }

  // Create enquiry (public)
  async createEnquiry(data) {
    const enquiry = await this.create(data);
    // Auto-assign to counsellor based on load or round-robin (simplified)
    await this.autoAssign(enquiry._id);
    return enquiry;
  }

  // Auto-assign to a counsellor (simple round-robin)
  async autoAssign(enquiryId) {
    const User = require('../models/User');
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('_id');
    if (counsellors.length === 0) return;
    const count = await AdmissionEnquiry.countDocuments();
    const index = count % counsellors.length;
    const assignedTo = counsellors[index]._id;
    await this.updateById(enquiryId, { assignedTo });
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
    const query = { assignedTo: counsellorId, deletedAt: null };
    if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;
    if (filters.callStatus) query.callStatus = filters.callStatus;
    if (filters.followUp) query.followUpDate = { $lte: new Date() };
    return this.findAll(query, pagination, { createdAt: -1 });
  }

  // Get all enquiries for admin
  async getAllEnquiries(filters = {}, pagination = {}) {
    const query = { deletedAt: null };
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;
    return this.findAll(query, pagination, { createdAt: -1 });
  }
}

module.exports = new EnquiryService();