const slugify = require('slugify');

const createSlug = (text, options = {}) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    ...options,
  });
};

module.exports = createSlug;