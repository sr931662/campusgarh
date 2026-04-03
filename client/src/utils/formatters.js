import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format a package value stored in LPA (e.g. 21 → "₹21 LPA")
 * @param {number} lpa - Package value already in Lakhs Per Annum
 * @returns {string} Formatted LPA string
 */
export const formatLPA = (lpa) => {
  if (!lpa && lpa !== 0) return 'N/A';
  const n = Number(lpa);
  const display = n % 1 === 0 ? n.toFixed(0) : n.toFixed(1);
  return `₹${display} LPA`;
};

/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Date format (default: 'dd MMM yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD")
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format phone number to Indian format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
  }
  return phone;
};

/**
 * Get rating stars as array
 * @param {number} rating - Rating (1-5)
 * @returns {Array} Array of star types ('full', 'half', 'empty')
 */
export const getRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  for (let i = 0; i < fullStars; i++) stars.push('full');
  if (hasHalfStar) stars.push('half');
  while (stars.length < 5) stars.push('empty');
  return stars;
};