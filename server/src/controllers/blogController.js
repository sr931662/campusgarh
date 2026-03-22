const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const blogService = require('../services/blogService');

class BlogController {
  createBlog = catchAsync(async (req, res) => {
    const blog = await blogService.createBlog(req.body, req.user.id);
    ResponseHandler.success(res, blog, 'Blog created', 201);
  });

  getAllBlogs = catchAsync(async (req, res) => {
    const { page, limit, status, category } = req.query;
    const isAdminOrMod = req.user && ['admin', 'moderator'].includes(req.user.role);
    let result;

    if (category) {
      result = await blogService.getBlogsByCategory(category, { page, limit });
    } else if (isAdminOrMod && status && status !== 'published') {
      // Admins/moderators can filter by any status, but never return soft-deleted
      result = await blogService.findAll({ status, deletedAt: null }, { page, limit }, { publishedAt: -1 });
    } else {
      // Public users always get only published, non-deleted blogs
      result = await blogService.getPublishedBlogs({ page, limit });
    }
    ResponseHandler.success(res, result);
  });

  getBlogById = catchAsync(async (req, res) => {
    const blog = await blogService.findById(req.params.id);
    ResponseHandler.success(res, blog);
  });

  getBlogBySlug = catchAsync(async (req, res) => {
    const blog = await blogService.getBySlug(req.params.slug);
    ResponseHandler.success(res, blog);
  });

  updateBlog = catchAsync(async (req, res) => {
    const blog = await blogService.updateBlog(req.params.id, req.body);
    ResponseHandler.success(res, blog, 'Blog updated');
  });

  deleteBlog = catchAsync(async (req, res) => {
    const result = await blogService.deleteById(req.params.id);
    ResponseHandler.success(res, result, 'Blog deleted');
  });
  getCategories = catchAsync(async (req, res) => {
    const categories = await blogService.getCategories();
    ResponseHandler.success(res, categories);
  });
  getBlogsByTag = catchAsync(async (req, res) => {
    const { tag } = req.params;
    const { page, limit } = req.query;
    const result = await blogService.getBlogsByTag(tag, { page, limit });
    ResponseHandler.success(res, result);
  });
}

module.exports = new BlogController();