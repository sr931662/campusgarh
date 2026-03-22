// Role constants (matches backend)
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  COUNSELLOR: 'counsellor',
  MODERATOR: 'moderator',
  INSTITUTION_REP: 'institution_rep',
};

// Review status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

// Enquiry conversion status
export const CONVERSION_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  NOT_INTERESTED: 'not_interested',
  CONVERTED: 'converted',
  LOST: 'lost',
};

// Enquiry call status
export const CALL_STATUS = {
  PENDING: 'pending',
  CONNECTED: 'connected',
  NOT_REACHABLE: 'not_reachable',
  FOLLOW_UP: 'follow_up',
};

// Blog status
export const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Course categories
export const COURSE_CATEGORIES = ['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'];

// College type = discipline / academic focus
export const COLLEGE_TYPES = [
  'Engineering & Technology', 'Medical & Health Sciences',
  'Management & Business', 'Law', 'Arts & Science',
  'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts',
  'Commerce & Finance', 'Technical', 'Multi-Disciplinary',
];

// Funding type = ownership / backing model
export const FUNDING_TYPES = [
  'Government', 'Private', 'Semi-Government',
  'Public-Private Partnership', 'Deemed University',
  'Private University', 'Central University', 'State University',
  'Autonomous', 'Minority Institution',
];

// NAAC Grades
export const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'];

// Regulatory approval bodies
export const APPROVED_BY_OPTIONS = ['UGC', 'AICTE', 'NBA', 'MCI', 'BCI', 'PCI', 'COA', 'ICAR', 'NCTE'];

// Campus types
export const CAMPUS_TYPES = ['Urban', 'Semi-Urban', 'Suburban', 'Rural'];

// Admission modes
export const ADMISSION_MODES = ['Entrance-Based', 'Merit-Based', 'Both'];

// Placement % filter options
export const PLACEMENT_RANGES = [
  { label: '70%+', value: '70' },
  { label: '80%+', value: '80' },
  { label: '90%+', value: '90' },
  { label: '95%+', value: '95' },
];

// Avg package filter options
export const PACKAGE_RANGES = [
  { label: '5L+', value: '500000' },
  { label: '8L+', value: '800000' },
  { label: '12L+', value: '1200000' },
  { label: '20L+', value: '2000000' },
];

// Indian states
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

// Course disciplines (same as college types - shared academic domains)
export const COURSE_DISCIPLINES = [
  'Engineering & Technology', 'Medical & Health Sciences',
  'Management & Business', 'Law', 'Arts & Science',
  'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts',
  'Commerce & Finance', 'Technical', 'Multi-Disciplinary',
];

// Course study modes
export const COURSE_MODES = ['Full-time', 'Part-time', 'Online', 'Distance'];

// Course admission types
export const ADMISSION_TYPES = ['Entrance-Based', 'Merit-Based', 'Direct Admission', 'Interview-Based'];

// Min avg starting salary filter options for courses
export const SALARY_RANGES = [
  { label: '3L+', value: '300000' },
  { label: '5L+', value: '500000' },
  { label: '8L+', value: '800000' },
  { label: '12L+', value: '1200000' },
];

// Exam levels
export const EXAM_LEVELS = ['National', 'State', 'University-Level', 'Institute-Level'];

// Exam modes (matches Exam model enum)
export const EXAM_MODES = ['Online (CBT)', 'Offline (OMR)', 'Online + Offline', 'Remote Proctored'];

// API endpoints (base)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'campusgarh_token',
  USER: 'campusgarh_user',
  THEME: 'campusgarh_theme',
};