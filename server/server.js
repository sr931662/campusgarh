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
const emailService = require('./src/services/emailService');

// Initialize express
const app = express();

// Trust Render/proxy X-Forwarded-For headers (required for rate limiting behind a proxy)
app.set('trust proxy', 1);

// Create necessary directories if they don't exist
// const directories = ['logs', 'uploads'];
// directories.forEach(dir => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir);
// });

const directories = ['logs', 'uploads'];
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
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

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// // robots.txt
// app.get('/robots.txt', (req, res) => {
//   res.type('text/plain');
//   res.send(
//     `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api\n\nSitemap: ${process.env.CLIENT_URL || 'https://campusgarh.com'}/sitemap.xml`
//   );
// });

// Helper — always returns single canonical domain
const SITE_URL = () => (process.env.CLIENT_URL || 'https://campusgarh.com').split(',')[0].trim();


// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send([
    'User-agent: *',
    'Allow: /',
    '',
    '# Private / auth pages',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /forgot-password',
    'Disallow: /reset-password',
    'Disallow: /verify-email',
    '',
    '# User dashboards',
    'Disallow: /profile',
    'Disallow: /predictor',
    'Disallow: /dashboard/',
    '',
    '# Admin & internal',
    'Disallow: /admin/',
    'Disallow: /partner/dashboard',
    'Disallow: /partner/leads',
    'Disallow: /partner/import',
    '',
    '# API',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_URL()}/sitemap.xml`,
  ].join('\n'));
});

// ── Sitemap helpers ──────────────────────────────────────────
const urlTag = (loc, lastmod, changefreq, priority) =>
  `\n  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const wrapUrlset = (urls) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}\n</urlset>`;

// Master sitemap index
app.get('/sitemap.xml', (req, res) => {
  const BASE = SITE_URL();
  const now = new Date().toISOString();
  const sitemaps = ['static', 'colleges', 'courses', 'exams', 'blogs'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>\n    <loc>${BASE}/sitemap-${s}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Static pages sitemap
app.get('/sitemap-static.xml', (req, res) => {
  const BASE = SITE_URL();
  const now = new Date().toISOString();
  const pages = [
    { path: '',                      changefreq: 'daily',   priority: '1.0' },
    { path: '/colleges',             changefreq: 'daily',   priority: '0.9' },
    { path: '/courses',              changefreq: 'weekly',  priority: '0.8' },
    { path: '/exams',                changefreq: 'weekly',  priority: '0.8' },
    { path: '/blogs',                changefreq: 'daily',   priority: '0.8' },
    { path: '/compare',              changefreq: 'monthly', priority: '0.6' },
    { path: '/about',                changefreq: 'monthly', priority: '0.7' },
    { path: '/contact',              changefreq: 'monthly', priority: '0.6' },
    { path: '/partner',              changefreq: 'monthly', priority: '0.6' },
    { path: '/careers',              changefreq: 'monthly', priority: '0.5' },
    { path: '/advertise',            changefreq: 'monthly', priority: '0.5' },
    { path: '/privacy-policy',       changefreq: 'yearly',  priority: '0.3' },
    { path: '/terms-and-conditions', changefreq: 'yearly',  priority: '0.3' },
    { path: '/engineering-colleges',  changefreq: 'weekly', priority: '0.8' },
    { path: '/management-colleges',   changefreq: 'weekly', priority: '0.8' },
    { path: '/medical-colleges',      changefreq: 'weekly', priority: '0.8' },
    { path: '/law-colleges',          changefreq: 'weekly', priority: '0.8' },
    { path: '/commerce-colleges',     changefreq: 'weekly', priority: '0.8' },
    { path: '/arts-colleges',         changefreq: 'weekly', priority: '0.7' },
    { path: '/science-colleges',      changefreq: 'weekly', priority: '0.7' },
    { path: '/architecture-colleges', changefreq: 'weekly', priority: '0.7' },
    { path: '/pharmacy-colleges',     changefreq: 'weekly', priority: '0.7' },
    { path: '/ug-courses',            changefreq: 'weekly', priority: '0.8' },
    { path: '/pg-courses',            changefreq: 'weekly', priority: '0.8' },
    { path: '/diploma-courses',       changefreq: 'weekly', priority: '0.7' },
    { path: '/doctorate-courses',     changefreq: 'weekly', priority: '0.6' },
    { path: '/certificate-courses',   changefreq: 'weekly', priority: '0.6' },

  ];
  res.header('Content-Type', 'application/xml');
  res.send(wrapUrlset(pages.map(p => urlTag(`${BASE}${p.path}`, now, p.changefreq, p.priority))));
});

// Colleges sitemap
app.get('/sitemap-colleges.xml', async (req, res) => {
  try {
    const BASE = SITE_URL();
    const now = new Date().toISOString();
    const colleges = await College.find({ isActive: true }, 'slug updatedAt').lean();
    res.header('Content-Type', 'application/xml');
    res.send(wrapUrlset(colleges.map(c => urlTag(`${BASE}/colleges/${c.slug}`, c.updatedAt ? new Date(c.updatedAt).toISOString() : now, 'weekly', '0.8'))));
  } catch { res.status(500).json({ message: 'Failed' }); }
});

// Courses sitemap
app.get('/sitemap-courses.xml', async (req, res) => {
  try {
    const BASE = SITE_URL();
    const now = new Date().toISOString();
    const courses = await Course.find({ isActive: true }, 'slug updatedAt').lean();
    res.header('Content-Type', 'application/xml');
    res.send(wrapUrlset(courses.map(c => urlTag(`${BASE}/courses/${c.slug}`, c.updatedAt ? new Date(c.updatedAt).toISOString() : now, 'monthly', '0.6'))));
  } catch { res.status(500).json({ message: 'Failed' }); }
});

// Exams sitemap
app.get('/sitemap-exams.xml', async (req, res) => {
  try {
    const BASE = SITE_URL();
    const now = new Date().toISOString();
    const exams = await Exam.find({ isActive: true }, 'slug updatedAt').lean();
    res.header('Content-Type', 'application/xml');
    res.send(wrapUrlset(exams.map(e => urlTag(`${BASE}/exams/${e.slug}`, e.updatedAt ? new Date(e.updatedAt).toISOString() : now, 'weekly', '0.7'))));
  } catch { res.status(500).json({ message: 'Failed' }); }
});

// Blogs sitemap
app.get('/sitemap-blogs.xml', async (req, res) => {
  try {
    const BASE = SITE_URL();
    const now = new Date().toISOString();
    const blogs = await Blog.find({ status: 'published' }, 'slug updatedAt').lean();
    res.header('Content-Type', 'application/xml');
    res.send(wrapUrlset(blogs.map(b => urlTag(`${BASE}/blogs/${b.slug}`, b.updatedAt ? new Date(b.updatedAt).toISOString() : now, 'weekly', '0.6'))));
  } catch { res.status(500).json({ message: 'Failed' }); }
});


// Bot OG preview routes
const FALLBACK_OG_IMAGE = 'https://campusgarh.com/favicon/ms-icon-150x150.png';

function buildOgHtml({ title, desc, image, url, type }) {
  const safeTitle = title.replace(/"/g, '&quot;');
  const safeDesc = desc.replace(/"/g, '&quot;');
  const img = image || FALLBACK_OG_IMAGE;
  return `<!DOCTYPE html><html prefix="og: https://ogp.me/ns#"><head>
  <meta charset="UTF-8">
  <title>${safeTitle} | CampusGarh</title>
  <meta property="og:site_name" content="CampusGarh">
  <meta property="og:title" content="${safeTitle} | CampusGarh">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:secure_url" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${type}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@campusgarh">
  <meta name="twitter:title" content="${safeTitle} | CampusGarh">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${img}">
  <meta name="twitter:image:alt" content="${safeTitle}">
  <link rel="canonical" href="${url}">
  <meta http-equiv="refresh" content="0;url=${url}">
</head><body><a href="${url}">${safeTitle}</a></body></html>`;
}

app.get('/og/college/:slug', async (req, res) => {
  try {
    const college = await College.findOne({ slug: req.params.slug }).select('name description logoUrl coverImageUrl slug shortName');
    if (!college) return res.redirect(process.env.CLIENT_URL);
    const title = college.name;
    const desc = (college.description || '').substring(0, 200).replace(/[#*_`[\]]/g, '').trim();
    const image = college.coverImageUrl || college.logoUrl || '';
    const url = `${process.env.CLIENT_URL}/colleges/${college.slug}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
    return res.send(buildOgHtml({ title, desc, image, url, type: 'website' }));
  } catch { res.redirect(process.env.CLIENT_URL); }
});

app.get('/og/news/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).select('title excerpt featuredImageUrl slug');
    if (!blog) return res.redirect(process.env.CLIENT_URL);
    const title = blog.title;
    const desc = (blog.excerpt || '').substring(0, 200).trim();
    const image = blog.featuredImageUrl || '';
    const url = `${process.env.CLIENT_URL}/news/${blog.slug}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
    return res.send(buildOgHtml({ title, desc, image, url, type: 'article' }));
  } catch { res.redirect(process.env.CLIENT_URL); }
});

app.post('/api/v1/share/email', async (req, res) => {
  try {
    const { to, title, url, image, excerpt } = req.body;
    if (!to || !title || !url) return res.status(400).json({ message: 'Missing required fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(400).json({ message: 'Invalid email address' });
    await emailService.sendShareEmail({ to, title, url, image, excerpt });
    res.json({ success: true });
  } catch (e) {
    console.error('Share email error:', e);
    res.status(500).json({ message: 'Failed to send email' });
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
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
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