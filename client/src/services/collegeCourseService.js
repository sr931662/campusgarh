import api from './api';

export const collegeCourseService = {
  // Get courses offered at a specific college (with mapping details)
  getCoursesForCollege: (collegeId) => api.get(`/college-courses/college/${collegeId}`),

  // Get colleges offering a specific course (with mapping details)
  getCollegesForCourse: (courseId) => api.get(`/college-courses/course/${courseId}`),
};
