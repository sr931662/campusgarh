import api from './api';

export const predictorService = {
  predictColleges: (params) => api.get('/predictor/colleges', { params }),
  predictCourses:  (params) => api.get('/predictor/courses',  { params }),
  predictExams:    (params) => api.get('/predictor/exams',    { params }),
  getCollegeDetailedAnalysis: (params) => api.get('/predictor/college-detail', { params }),

};
