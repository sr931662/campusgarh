const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  // Simple formatting – you could use moment.js or date-fns
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-IN', options);
};

const getCurrentIST = () => {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000; // IST offset
  return new Date(now.getTime() + offset);
};

module.exports = { formatDate, getCurrentIST };