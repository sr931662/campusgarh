const { body, param, query } = require('express-validator');
const { isMongoId } = require('./common');

const createBlogValidator = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('content').notEmpty().withMessage('Content is required'),
  body('categories').optional().isArray(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
];

const updateBlogValidator = [
  isMongoId('id'),
  ...createBlogValidator.map(rule => rule.optional()),
];

const getBlogBySlugValidator = [
  param('slug').notEmpty().withMessage('Slug is required'),
];

module.exports = {
  createBlogValidator,
  updateBlogValidator,
  getBlogBySlugValidator,
};