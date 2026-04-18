import api from './api';

export const collegeCourseService = {
  getCoursesForCollege: (collegeId) => api.get(`/college-courses/college/${collegeId}`),
  getCollegesForCourse: (courseId) => api.get(`/college-courses/course/${courseId}`),
  getCollegesForExam: (examId) => api.get(`/college-courses/exam/${examId}`),
  createMapping: (data) => api.post('/college-courses', data),
  updateMapping: (mappingId, data) => api.patch(`/college-courses/${mappingId}`, data),
  deleteMapping: (mappingId) => api.delete(`/college-courses/${mappingId}`),
};
