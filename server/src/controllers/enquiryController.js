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