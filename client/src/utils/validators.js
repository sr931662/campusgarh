import * as yup from 'yup';

// Common validation schemas
export const emailSchema = yup.string().email('Invalid email').required('Email is required');
export const passwordSchema = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'Password must contain at least one letter and one number')
  .required('Password is required');
export const phoneSchema = yup
  .string()
  .transform((value) => (value === '' ? undefined : value))
  .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
  .optional();

// Login form validation
export const loginValidationSchema = yup.object().shape({
  email: emailSchema,
  password: yup.string().required('Password is required'),
});

// Registration form validation
export const registerValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: phoneSchema,
});

// Forgot password validation
export const forgotPasswordValidationSchema = yup.object().shape({
  email: emailSchema,
});

// Reset password validation
export const resetPasswordValidationSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

// College review validation
export const reviewValidationSchema = yup.object().shape({
  rating: yup.number().min(1).max(5).required('Rating is required'),
  title: yup.string().required('Title is required').max(100, 'Title too long'),
  content: yup.string().required('Review content is required'),
  courseStudied: yup.string().optional(),
  graduationYear: yup
    .number()
    .min(1950, 'Year must be after 1950')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional(),
});

// Enquiry form validation
export const enquiryValidationSchema = yup.object().shape({
  studentName: yup.string().required('Name is required'),
  phone: phoneSchema.required('Phone is required'),
  email: emailSchema,
  courseInterest: yup.string().optional(),
  collegeInterest: yup.string().optional(),
  preferredCity: yup.string().optional(),
  message: yup.string().optional(),
});

// Profile update validation
export const profileValidationSchema = yup.object().shape({
  name: yup.string().optional(),
  phone: phoneSchema,
  academicBackground: yup.object().shape({
    qualification: yup.string().optional(),
    institution: yup.string().optional(),
    yearOfPassing: yup.number().min(1950).optional(),
    percentage: yup.number().min(0).max(100).optional(),
  }),
  budgetRange: yup.object().shape({
    min: yup.number().min(0).optional(),
    max: yup.number().min(0).optional(),
  }),
});