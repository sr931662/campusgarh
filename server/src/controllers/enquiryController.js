const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const enquiryService = require('../services/enquiryService');

class EnquiryController {
  // Public: create enquiry
  createEnquiry = catchAsync(async (req, res) => {
    const enquiry = await enquiryService.createEnquiry(req.body);
    ResponseHandler.success(res, enquiry, 'Enquiry submitted successfully', 201);
  });

  // Counsellor: get assigned enquiries
  getMyEnquiries = catchAsync(async (req, res) => {
    const { conversionStatus, callStatus, followUp, page, limit } = req.query;
    const filters = { conversionStatus, callStatus, followUp };
    const result = await enquiryService.getCounsellorEnquiries(req.user.id, filters, { page, limit });
    ResponseHandler.success(res, result);
  });

  // Admin: get all enquiries
  getAllEnquiries = catchAsync(async (req, res) => {
    const { assignedTo, conversionStatus, page, limit } = req.query;
    const filters = { assignedTo, conversionStatus };
    const result = await enquiryService.getAllEnquiries(filters, { page, limit });
    ResponseHandler.success(res, result);
  });

  // Admin: per-counsellor analytics
  getCounsellorAnalytics = catchAsync(async (_req, res) => {
    const AdmissionEnquiry = enquiryService.model;
    const rows = await AdmissionEnquiry.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$conversionStatus', 'converted'] }, 1, 0] } },
          contacted: { $sum: { $cond: [{ $eq: ['$conversionStatus', 'contacted'] }, 1, 0] } },
          interested: { $sum: { $cond: [{ $eq: ['$conversionStatus', 'interested'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'counsellor',
        },
      },
      { $unwind: { path: '$counsellor', preserveNullAndEmptyArrays: true } },
      { $sort: { converted: -1 } },
      {
        $project: {
          _id: 1,
          total: 1,
          converted: 1,
          contacted: 1,
          interested: 1,
          'counsellor._id': 1,
          'counsellor.name': 1,
          'counsellor.email': 1,
        },
      },
    ]);
    ResponseHandler.success(res, rows);
  });

  // Partner: paginated list of own leads | Admin: pass ?partnerId= for any partner
  getPartnerLeads = catchAsync(async (req, res) => {
    const mongoose = require('mongoose');
    const partnerId =
      req.user.role === 'admin' && req.query.partnerId
        ? new mongoose.Types.ObjectId(req.query.partnerId)
        : new mongoose.Types.ObjectId(req.user.id);
    const { page = 1, limit = 20, conversionStatus, callStatus } = req.query;
    const result = await enquiryService.getPartnerLeads(partnerId, { conversionStatus, callStatus }, { page, limit });
    ResponseHandler.success(res, result);
  });

  // Partner: analytics for own leads | Admin: pass ?partnerId= for any partner
  getPartnerAnalytics = catchAsync(async (req, res) => {
    const AdmissionEnquiry = enquiryService.model;
    const mongoose = require('mongoose');

    const partnerId =
      req.user.role === 'admin' && req.query.partnerId
        ? new mongoose.Types.ObjectId(req.query.partnerId)
        : new mongoose.Types.ObjectId(req.user.id);

    const [statusBreakdown, total, converted] = await Promise.all([
      AdmissionEnquiry.aggregate([
        { $match: { deletedAt: null, importedBy: partnerId } },
        { $group: { _id: '$conversionStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AdmissionEnquiry.countDocuments({ deletedAt: null, importedBy: partnerId }),
      AdmissionEnquiry.countDocuments({ deletedAt: null, importedBy: partnerId, conversionStatus: 'converted' }),
    ]);

    ResponseHandler.success(res, { total, converted, statusBreakdown });
  });

  // Get single enquiry (admin or assigned counsellor)
  getEnquiry = catchAsync(async (req, res) => {
    const enquiry = await enquiryService.findById(req.params.id);
    // Check permissions
    if (req.user.role !== 'admin' && enquiry.assignedTo?.toString() !== req.user.id) {
      return ResponseHandler.error(res, { message: 'Not authorized' }, 403);
    }
    ResponseHandler.success(res, enquiry);
  });

  // Assign enquiry (admin)
  assignEnquiry = catchAsync(async (req, res) => {
    const { enquiryId, counsellorId } = req.params;
    const enquiry = await enquiryService.assignEnquiry(enquiryId, counsellorId);
    ResponseHandler.success(res, enquiry);
  });

  // Add note
  addNote = catchAsync(async (req, res) => {
    const { enquiryId } = req.params;
    const { note } = req.body;
    const enquiry = await enquiryService.addNote(enquiryId, note, req.user.id);
    ResponseHandler.success(res, enquiry);
  });

  // Update call status
  updateCallStatus = catchAsync(async (req, res) => {
    const { enquiryId } = req.params;
    const { callStatus, followUpDate } = req.body;
    const enquiry = await enquiryService.updateCallStatus(enquiryId, callStatus, followUpDate);
    ResponseHandler.success(res, enquiry);
  });

  // Update conversion status
  updateConversionStatus = catchAsync(async (req, res) => {
    const { enquiryId } = req.params;
    const { conversionStatus } = req.body;
    const enquiry = await enquiryService.updateConversionStatus(enquiryId, conversionStatus);
    ResponseHandler.success(res, enquiry);
  });
  
}

module.exports = new EnquiryController();