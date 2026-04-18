import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { collegeService } from '../services/collegeService';
import { courseService } from '../services/courseService';
import { examService } from '../services/examService';
import { reviewService } from '../services/reviewService';
import { blogService } from '../services/blogService';
import { enquiryService } from '../services/enquiryService';
import { comparisonService } from '../services/comparisonService';
import { mediaService } from '../services/mediaService';
import { importExportService } from '../services/importExportService';
import { adminService } from '../services/adminService';
import { collegeCourseService } from '../services/collegeCourseService';
import { featuredLinkService } from '../services/featuredLinkService';

// ========== Auth Hooks ==========
export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful! Please verify your email.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const { user, token } = data.data.data;
      useAuthStore.getState().setAuth(user, token);
      queryClient.setQueryData(['user'], user);
      toast.success('Login successful');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => toast.success('Password reset link sent to your email'),
    onError: (error) => toast.error(error.response?.data?.message || 'Request failed'),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }) => authService.resetPassword(token, password),
    onSuccess: () => toast.success('Password reset successful. Please login.'),
    onError: (error) => toast.error(error.response?.data?.message || 'Reset failed'),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => toast.success('Password changed successfully'),
    onError: (error) => toast.error(error.response?.data?.message || 'Change failed'),
  });
};

// ========== User Hooks ==========
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: userService.getProfile,
    staleTime: Infinity,
    retry: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data);
      toast.success('Profile updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Update failed'),
  });
};

export const useToggleSavedCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.toggleSavedCollege,
    onSuccess: (response, collegeId) => {
      const saved = response?.data?.data?.saved;
      // Sync Zustand store so isSaved updates instantly (no refetch needed)
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const existing = currentUser.savedColleges || [];
        const updated = saved
          ? [...existing, collegeId]
          : existing.filter(id => String(id) !== String(collegeId));
        useAuthStore.getState().updateUser({ savedColleges: updated });
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useToggleSavedCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.toggleSavedCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// ========== College Hooks ==========
export const useColleges = (params, options = {}) => {
  return useQuery({
    queryKey: ['colleges', params],
    queryFn: () => collegeService.getColleges(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useFeaturedColleges = (params) => {
  return useQuery({
    queryKey: ['featuredColleges', params],
    queryFn: () => collegeService.getFeatured(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOnlineColleges = (params) => {
  return useQuery({
    queryKey: ['onlineColleges', params],
    queryFn: () => collegeService.getOnline(params),
  });
};


export const useCollegesByCourse = (courseId, params) => {
  return useQuery({
    queryKey: ['collegesByCourse', courseId, params],
    queryFn: () => collegeService.getCollegesByCourse(courseId, params),
    enabled: !!courseId,
  });
};

export const useCollegeBySlug = (slug) => {
  return useQuery({
    queryKey: ['college', slug],
    queryFn: () => collegeService.getCollegeBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collegeService.createCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College created');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Creation failed'),
  });
};

export const useUpdateCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => collegeService.updateCollege(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['college', id] });
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College updated');
    },
  });
};

export const useDeleteCollege = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collegeService.deleteCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College deleted');
    },
  });
};

export const useUploadCollegeLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => collegeService.uploadCollegeLogo(id, formData),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['college', slug] });
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('Logo uploaded');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Logo upload failed'),
  });
};

// ========== CollegeCourse Hooks ==========
export const useCoursesForCollege = (collegeId) => {
  return useQuery({
    queryKey: ['collegeCourses', collegeId],
    queryFn: () => collegeCourseService.getCoursesForCollege(collegeId),
    enabled: !!collegeId,
  });
};

export const useCollegesForCourse = (courseId) => {
  return useQuery({
    queryKey: ['courseColleges', courseId],
    queryFn: () => collegeCourseService.getCollegesForCourse(courseId),
    enabled: !!courseId,
  });
};

export const useCoursesForExam = (examId) => {
  return useQuery({
    queryKey: ['coursesForExam', examId],
    queryFn: () => courseService.getCourses({ examId, limit: 50 }),
    enabled: !!examId,
  });
};

export const useCollegesForExam = (examId) => {
  return useQuery({
    queryKey: ['collegesForExam', examId],
    queryFn: () => collegeCourseService.getCollegesForExam(examId),
    enabled: !!examId,
  });
};

export const useCreateCollegeCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: collegeCourseService.createMapping,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['collegeCourses', vars?.college] });
      toast.success('Course mapping added');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add mapping'),
  });
};

export const useDeleteCollegeCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mappingId }) => collegeCourseService.deleteMapping(mappingId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['collegeCourses', vars?.collegeId] });
      toast.success('Course mapping removed');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove mapping'),
  });
};

// ========== Course Hooks ==========
export const useCourses = (params) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseService.getCourses(params),
    placeholderData: keepPreviousData,
  });
};

export const useCourseBySlug = (slug) => {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: () => courseService.getCourseBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created');
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => courseService.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated');
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted');
    },
  });
};

// ========== Exam Hooks ==========
export const useExams = (params) => {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => examService.getExams(params),
    placeholderData: keepPreviousData,
  });
};

export const useUpcomingExams = () => {
  return useQuery({
    queryKey: ['upcomingExams'],
    queryFn: examService.getUpcomingExams,
  });
};

export const useExamBySlug = (slug) => {
  return useQuery({
    queryKey: ['exam', slug],
    queryFn: () => examService.getExamBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam created');
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => examService.updateExam(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated');
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted');
    },
  });
};

// ========== Review Hooks ==========
export const useCollegeReviews = (collegeId, params) => {
  return useQuery({
    queryKey: ['reviews', collegeId, params],
    queryFn: () => reviewService.getCollegeReviews(collegeId, params),
    enabled: !!collegeId,
  });
};

export const useAverageRating = (collegeId) => {
  return useQuery({
    queryKey: ['rating', collegeId],
    queryFn: () => reviewService.getAverageRating(collegeId),
    enabled: !!collegeId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.college] });
      queryClient.invalidateQueries({ queryKey: ['rating', variables.college] });
      toast.success('Review submitted for moderation');
    },
  });
};

export const useMarkHelpful = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId }) => reviewService.markHelpful(reviewId),
    onSuccess: (_, { collegeId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', collegeId] });
    },
  });
};

export const useFlagReview = () => {
  return useMutation({
    mutationFn: reviewService.flagReview,
    onSuccess: () => toast.success('Review flagged for review'),
  });
};

// ========== Blog Hooks ==========
export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blogCategories'],
    queryFn: blogService.getCategories,
  });
};

export const useBlogs = (params) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogService.getBlogs(params),
    placeholderData: keepPreviousData,
  });
};

export const useBlogBySlug = (slug) => {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogService.getBlogBySlug(slug),
    enabled: !!slug,
  });
};

export const useBlogsByTag = (tag, params) => {
  return useQuery({
    queryKey: ['blogsByTag', tag, params],
    queryFn: () => blogService.getBlogsByTag(tag, params),
    enabled: !!tag,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogService.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog created');
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogService.updateBlog(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog updated');
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog deleted');
    },
  });
};

// ========== Enquiry Hooks ==========
export const useCreateEnquiry = () => {
  return useMutation({
    mutationFn: enquiryService.createEnquiry,
    onSuccess: () => toast.success('Enquiry submitted. We will contact you soon.'),
    onError: (error) => toast.error(error.response?.data?.message || 'Submission failed'),
  });
};
export const useAdminCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.adminCreateUser(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-users']);
      toast.success('User account created successfully');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create user'),
  });
};

export const useEnquiry = (id) => {
  return useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiryService.getEnquiry(id),
    enabled: !!id,
  });
};

export const useMyEnquiries = (params) => {
  return useQuery({
    queryKey: ['myEnquiries', params],
    queryFn: () => enquiryService.getMyEnquiries(params),
  });
};

export const useAllEnquiries = (params) => {
  return useQuery({
    queryKey: ['allEnquiries', params],
    queryFn: () => enquiryService.getAllEnquiries(params),
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, note }) => enquiryService.addNote(enquiryId, note),
    onSuccess: (_, { enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['myEnquiries'] });
      toast.success('Note added');
    },
  });
};

export const useUpdateCallStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, callStatus, followUpDate }) =>
      enquiryService.updateCallStatus(enquiryId, callStatus, followUpDate),
    onSuccess: (_, { enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['myEnquiries'] });
      toast.success('Call status updated');
    },
  });
};

export const useUpdateConversionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, conversionStatus }) =>
      enquiryService.updateConversionStatus(enquiryId, conversionStatus),
    onSuccess: (_, { enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['myEnquiries'] });
      toast.success('Conversion status updated');
    },
  });
};

// ========== Comparison Hooks ==========
export const useUserComparisons = () => {
  return useQuery({
    queryKey: ['comparisons'],
    queryFn: comparisonService.getUserComparisons,
  });
};

export const useComparison = (id) => {
  return useQuery({
    queryKey: ['comparison', id],
    queryFn: () => comparisonService.getComparison(id),
    enabled: !!id,
  });
};

export const useCreateComparison = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: comparisonService.createComparison,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparisons'] });
      toast.success('Comparison created');
    },
  });
};

export const useUpdateComparison = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => comparisonService.updateComparison(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['comparison', id] });
      queryClient.invalidateQueries({ queryKey: ['comparisons'] });
      toast.success('Comparison updated');
    },
  });
};
export const useDeleteEnquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => enquiryService.deleteEnquiry(id),
    onSuccess: () => {
      qc.invalidateQueries(['enquiries']);
      toast.success('Enquiry deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });
};

export const useDeleteComparison = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: comparisonService.deleteComparison,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparisons'] });
      toast.success('Comparison deleted');
    },
  });
};

// ========== Media Hooks ==========
export const useUploadFile = () => {
  return useMutation({
    mutationFn: mediaService.uploadFile,
    onSuccess: () => {
      toast.success('File uploaded');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Upload failed'),
  });
};

export const useUploadMultiple = () => {
  return useMutation({
    mutationFn: mediaService.uploadMultiple,
    onSuccess: () => {
      toast.success('Files uploaded');
    },
  });
};

export const useMediaForParent = (parentModel, parentId) => {
  return useQuery({
    queryKey: ['media', parentModel, parentId],
    queryFn: () => mediaService.getMediaForParent(parentModel, parentId),
    enabled: !!parentId && !!parentModel,
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mediaService.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('Media deleted');
    },
  });
};

// ========== Import/Export Hooks ==========

// Model → query key mapping so we know which cache to bust after import
const MODEL_QUERY_KEYS = {
  College:          ['colleges'],
  Course:           ['courses'],
  Exam:             ['exams'],
  Blog:             ['blogs'],
  AdmissionEnquiry: ['allEnquiries', 'myEnquiries'],
};

export const useImportExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formData }) => importExportService.importExcel(formData),
    onSuccess: (_, variables) => {
      // Always invalidate import logs
      queryClient.invalidateQueries({ queryKey: ['importLogs'] });

      // Invalidate the entity cache that was just imported so lists refresh immediately
      const model = variables?.model;
      const keys = MODEL_QUERY_KEYS[model];
      if (keys) {
        (Array.isArray(keys[0]) ? keys : [keys]).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
        });
      } else {
        // Fallback: invalidate everything relevant
        Object.values(MODEL_QUERY_KEYS).flat().forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      // Also nuke featured/upcoming caches
      queryClient.invalidateQueries({ queryKey: ['featuredColleges'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingExams'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Import failed'),
  });
};

export const useExportExcel = () => {
  return useMutation({
    mutationFn: ({ model, params }) => importExportService.exportExcel(model, params),
    onSuccess: (response, variables) => {
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variables.model}_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Export completed');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Export failed'),
  });
};

export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: (model) => importExportService.downloadTemplate(model),
    onSuccess: (response, model) => {
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Template downloaded');
    },
    onError: () => toast.error('Template download failed'),
  });
};

export const useImportLogs = (params) => {
  return useQuery({
    queryKey: ['importLogs', params],
    queryFn: () => importExportService.getImportLogs(params),
  });
};

// ========== Admin Hooks ==========
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminService.getAnalytics,
    staleTime: 60 * 1000,
  });
};

export const useAssignEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enquiryId, counsellorId }) =>
      enquiryService.assignEnquiry(enquiryId, counsellorId),
    onSuccess: (_, { enquiryId }) => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', enquiryId] });
      queryClient.invalidateQueries({ queryKey: ['allEnquiries'] });
      toast.success('Lead reassigned');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Assign failed'),
  });
};

export const useUpdateAcademicDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateAcademicDetails,
    onSuccess: () => { toast.success('Academic details updated'); queryClient.invalidateQueries({ queryKey: ['userProfile'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updatePreferences,
    onSuccess: () => { toast.success('Preferences updated'); queryClient.invalidateQueries({ queryKey: ['userProfile'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });
};

export const useRequestRoleChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.requestRoleChange,
    onSuccess: () => { toast.success('Role change request submitted!'); queryClient.invalidateQueries({ queryKey: ['myRoleRequests'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Request failed'),
  });
};

export const useMyRoleRequests = () =>
  useQuery({ queryKey: ['myRoleRequests'], queryFn: userService.getMyRoleRequests });

export const useAllRoleRequests = (params) =>
  useQuery({ queryKey: ['allRoleRequests', params], queryFn: () => userService.getAllRoleRequests(params) });

export const useReviewRoleRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => userService.reviewRoleRequest(id, data),
    onSuccess: () => { toast.success('Done!'); queryClient.invalidateQueries({ queryKey: ['allRoleRequests'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed'),
  });
};

// ========== Counsellor / Partner Analytics Hooks ==========

export const useCounsellors = () =>
  useQuery({
    queryKey: ['counsellors'],
    queryFn: adminService.getCounsellors,
    staleTime: 5 * 60 * 1000,
  });

export const useCounsellorAnalytics = () =>
  useQuery({
    queryKey: ['counsellorAnalytics'],
    queryFn: enquiryService.getCounsellorAnalytics,
    staleTime: 60 * 1000,
  });

export const usePartnerAnalytics = (partnerId) =>
  useQuery({
    queryKey: ['partnerAnalytics', partnerId],
    queryFn: () => enquiryService.getPartnerAnalytics(partnerId),
    staleTime: 60 * 1000,
  });

export const usePartnerLeads = (params) =>
  useQuery({
    queryKey: ['partnerLeads', params],
    queryFn: () => enquiryService.getPartnerLeads(params),
    placeholderData: keepPreviousData,
  });

// ========== Featured Links Hooks ==========
export const useFeaturedLinks = (params) =>
  useQuery({
    queryKey: ['featuredLinks', params],
    queryFn: () => featuredLinkService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
