const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const importExportService = require('../services/importExportService');
const ImportLog = require('../models/ImportLog');
const BaseService = require('../services/baseService');

class ImportExportController {
  // Import from Excel
  importExcel = catchAsync(async (req, res) => {
    if (!req.file) {
      return ResponseHandler.error(res, { message: 'No file uploaded' }, 400);
    }
    const { model } = req.body;

    // Partners may only import leads
    if (req.user.role === 'partner' && model !== 'AdmissionEnquiry') {
      return ResponseHandler.error(res, { message: 'Partners can only import leads (AdmissionEnquiry)' }, 403);
    }

    // Inject importedBy so the lead is tracked back to the partner
    const extraData = (req.user.role === 'partner' && model === 'AdmissionEnquiry')
      ? { importedBy: req.user._id, source: 'referral' }
      : {};

    const result = await importExportService.importFromExcel(req.file.path, model, req.user.id, extraData);
    // Always return 200 with the full result so the UI can display per-row errors
    ResponseHandler.success(res, result, 'Import completed');
  });

  // Export to Excel
  exportExcel = catchAsync(async (req, res) => {
    const { model } = req.params;
    const filter = { ...req.query };
    delete filter.page;
    delete filter.limit;
    const buffer = await importExportService.exportToExcel(model, filter);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${model}_export.xlsx`);
    res.send(buffer);
  });

  // Download blank template
  downloadTemplate = catchAsync(async (req, res) => {
    const { model } = req.params;
    const buffer = importExportService.generateTemplate(model);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${model}_template.xlsx`);
    res.send(buffer);
  });

  // Get import logs
  getImportLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, model: modelFilter, status } = req.query;
    const filter = {};
    if (modelFilter) filter.model = modelFilter;
    if (status) filter.status = status;

    const svc = new BaseService(ImportLog);
    const result = await svc.findAll(filter, { page, limit }, { createdAt: -1 });
    ResponseHandler.success(res, result);
  });
}

module.exports = new ImportExportController();