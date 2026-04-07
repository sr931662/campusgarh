const catchAsync = require('../utils/catchAsync');
const ResponseHandler = require('../utils/responseHandler');
const blogService = require('../services/blogService');

class BlogController {
  createBlog = catchAsync(async (req, res) => {
    const blog = await blogService.createBlog(req.body, req.user.id);
    ResponseHandler.success(res, blog, 'Blog created', 201);
  });

  getAllBlogs = catchAsync(async (req, res) => {
    const { page, limit, status, category, contentType, tag, sort } = req.query;
    const isAdminOrMod = req.user && ['admin', 'moderator'].includes(req.user.role);

    // Admin/mod: filter by status (non-published)
    if (isAdminOrMod && status && status !== 'published') {
      const filter = { deletedAt: null };
      if (status !== 'all') filter.status = status;
      const result = await blogService.findAll(filter, { page, limit }, { publishedAt: -1 });
      return ResponseHandler.success(res, result);
    }

    // All public requests go through the filtered method
    const result = await blogService.getFilteredBlogs({ page, limit, category, contentType, tag, sort });
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
  getFeaturedBlogs = catchAsync(async (req, res) => {
    const result = await blogService.getFeaturedBlogs(4);
    ResponseHandler.success(res, result);
  });

  toggleFeatured = catchAsync(async (req, res) => {
    const { featured } = req.body;
    const blog = await blogService.updateBlog(req.params.id, { featured });
    ResponseHandler.success(res, blog, `Blog ${featured ? 'featured' : 'unfeatured'} successfully`);
  });

  getAllBlogsAdmin = catchAsync(async (req, res) => {
    const { page, limit, status } = req.query;
    const filter = { deletedAt: null };
    if (status && status !== 'all') filter.status = status;
    const result = await blogService.findAll(filter, { page, limit }, { createdAt: -1 });
    ResponseHandler.success(res, result);
  });


}

module.exports = new BlogController();