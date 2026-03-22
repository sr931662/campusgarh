// Role constants
const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
  COUNSELLOR: 'counsellor',
  MODERATOR: 'moderator',
  INSTITUTION_REP: 'institution_rep',
};

// Review status
const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FLAGGED: 'flagged',
};

// Enquiry conversion status
const CONVERSION_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  NOT_INTERESTED: 'not_interested',
  CONVERTED: 'converted',
  LOST: 'lost',
};

// Blog status
const BLOG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Course categories
const COURSE_CATEGORIES = ['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'];

// College types
const COLLEGE_TYPES = ['Private', 'Government', 'Public-Private'];

export const EXAM_LEVELS = ['National', 'State', 'University-Level', 'Institute-Level'];
export const EXAM_MODES = ['Online (CBT)', 'Offline (OMR)', 'Online + Offline', 'Remote Proctored'];

module.exports = {
  ROLES,
  REVIEW_STATUS,
  CONVERSION_STATUS,
  BLOG_STATUS,
  COURSE_CATEGORIES,
  COLLEGE_TYPES,
  EXAM_LEVELS,
  EXAM_MODES
};