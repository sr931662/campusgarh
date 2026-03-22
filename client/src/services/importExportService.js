import api from './api';

export const importExportService = {
  // Import from Excel
  // Content-Type must be left unset so the browser sets multipart/form-data WITH boundary
  importExcel: (formData) =>
    api.post('/import-export/import', formData, {
      headers: { 'Content-Type': undefined },
    }),

  // Export to Excel
  exportExcel: (model, params) =>
    api.get(`/import-export/export/${model}`, {
      params,
      responseType: 'blob',
    }),

  // Get import logs
  getImportLogs: (params) => api.get('/import-export/logs', { params }),
};