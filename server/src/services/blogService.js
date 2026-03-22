const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const BaseService = require('./baseService');
const slugify = require('slugify');

class BlogService extends BaseService {
  constructor() {
    super(Blog);
  }

  async createBlog(data, authorId) {
    if (!data.slug) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    const blog = await this.create({ ...data, author: authorId });
    return blog;
  }

  async updateBlog(id, data) {
    if (data.title && !data.slug) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }
    return this.updateById(id, data);
  }

  async getBySlug(slug) {
    const blog = await this.findOne({ slug, deletedAt: null });
    // Increment views
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
    return blog;
  }

  async getPublishedBlogs(pagination = {}) {
    const query = { status: 'published', deletedAt: null };
    return this.findAll(query, pagination, { publishedAt: -1 });
  }

  async getBlogsByCategory(categoryId, pagination = {}) {
    const query = { categories: categoryId, status: 'published', deletedAt: null };
    return this.findAll(query, pagination, { publishedAt: -1 });
  }

  async getBlogsByTag(tag, pagination = {}) {
    const query = { tags: tag, status: 'published', deletedAt: null };
    return this.findAll(query, pagination, { publishedAt: -1 });
  }
  async getCategories() {
    // Return only active categories, sorted by name
    const categories = await BlogCategory.find({ deletedAt: null })
      .select('name slug description')
      .sort({ name: 1 })
      .lean();
    return categories;
  }
}

module.exports = new BlogService();