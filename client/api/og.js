// client/api/og.js
export default async function handler(req, res) {
  const { type, slug } = req.query;
  const API_BASE = process.env.VITE_API_BASE_URL || 'https://api.campusgarh.com';

  let title = 'CampusGarh';
  let description = 'Discover colleges, courses, exams and more on CampusGarh.';
  let image = 'https://campusgarh.com/og-default.jpg'; // replace with your actual default OG image URL
  let pageUrl = `https://campusgarh.com/${type === 'college' ? 'colleges' : 'news'}/${slug}`;

  try {
    if (type === 'college') {
      const r = await fetch(`${API_BASE}/api/v1/colleges/slug/${slug}`);
      const d = await r.json();
      if (d.success && d.data) {
        title = d.data.name;
        description = (d.data.description || '').substring(0, 200).replace(/[#*_`]/g, '') || `${d.data.name} - fees, placements, and admission info.`;
        image = d.data.coverImageUrl || d.data.logoUrl || image;
      }
    } else {
      const r = await fetch(`${API_BASE}/api/v1/blogs/slug/${slug}`);
      const d = await r.json();
      if (d.success && d.data) {
        title = d.data.title;
        description = d.data.excerpt || (d.data.content || '').substring(0, 200).replace(/[#*_`]/g, '');
        image = d.data.featuredImageUrl || d.data.featuredImage?.url || image;
      }
    }
  } catch (_) {}

  // Escape for HTML attributes
  const esc = (s) => String(s).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${esc(title)} | CampusGarh</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)} | CampusGarh">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="CampusGarh">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)} | CampusGarh">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(image)}">
  <meta http-equiv="refresh" content="0;url=${esc(pageUrl)}">
</head>
<body><p>Redirecting... <a href="${esc(pageUrl)}">${esc(title)}</a></p></body>
</html>`);
}
