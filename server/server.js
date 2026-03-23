const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Import configurations
const connectDB = require('./src/config/db');
const cors = require('./src/middleware/cors');
const securityMiddleware = require('./src/middleware/security');
const requestLogger = require('./src/middleware/requestLogger');
const { limiter, authLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const routes = require('./src/routes');

// Import models for sitemap generation
const College = require('./src/models/College');
const Course = require('./src/models/Course');
const Exam = require('./src/models/Exam');
const Blog = require('./src/models/Blog');

// Initialize express
const app = express();

// Trust Render/proxy X-Forwarded-For headers (required for rate limiting behind a proxy)
app.set('trust proxy', 1);

// Create necessary directories if they don't exist
const directories = ['logs', 'uploads'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Database connection
connectDB();

// Middleware — CORS must be first (before Helmet) to handle preflight OPTIONS correctly
app.use(cors);
app.use(securityMiddleware); // Helmet, compression, mongoSanitize
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

// Rate limiting
app.use('/api', limiter); // General rate limit (authLimiter applied per-route in authRoutes.js)

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api\n\nSitemap: ${process.env.CLIENT_URL || 'https://campusgarh.com'}/sitemap.xml`
  );
});

// Sitemap.xml - dynamically generated
app.get('/sitemap.xml', async (req, res) => {
  try {
    const BASE_URL = process.env.CLIENT_URL || 'https://campusgarh.com';
    const now = new Date().toISOString();

    const [colleges, courses, exams, blogs] = await Promise.all([
      College.find({ isActive: true }, 'slug updatedAt').lean(),
      Course.find({ isActive: true }, 'slug updatedAt').lean(),
      Exam.find({ isActive: true }, 'slug updatedAt').lean(),
      Blog.find({ status: 'published' }, 'slug updatedAt').lean(),
    ]);

    const staticPages = ['', '/colleges', '/courses', '/exams', '/blogs', '/compare', '/about', '/contact'];

    const urls = [
      ...staticPages.map((page) => `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`),
      ...colleges.map((c) => `
  <url>
    <loc>${BASE_URL}/colleges/${c.slug}</loc>
    <lastmod>${c.updatedAt ? new Date(c.updatedAt).toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...courses.map((c) => `
  <url>
    <loc>${BASE_URL}/courses/${c.slug}</loc>
    <lastmod>${c.updatedAt ? new Date(c.updatedAt).toISOString() : now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
      ...exams.map((e) => `
  <url>
    <loc>${BASE_URL}/exams/${e.slug}</loc>
    <lastmod>${e.updatedAt ? new Date(e.updatedAt).toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),
      ...blogs.map((b) => `
  <url>
    <loc>${BASE_URL}/blogs/${b.slug}</loc>
    <lastmod>${b.updatedAt ? new Date(b.updatedAt).toISOString() : now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ message: 'Sitemap generation failed' });
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});