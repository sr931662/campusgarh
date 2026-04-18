import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaNewspaper } from 'react-icons/fa';
import { useBlogBySlug } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import Button from '../common/Button/Button';
import styles from './BlogDetail.module.css';
import { formatDate } from '../../utils/formatters';
import { parseMarkdown } from '../../utils/parseMarkdown';
import SEOHead from '../common/SEOHead';
import { useBlogs } from '../../hooks/queries';
import BlogCard from './BlogCard';
import ShareButtons from '../common/ShareButtons/ShareButtons';

const CONTENT_TYPE_COLORS = {
  Guide: '#3b82f6', News: '#f59e0b', Ranking: '#8b5cf6',
  'College Review': '#10b981', 'Exam Update': '#ef4444',
  'Career Advice': '#0891b2', Scholarship: '#f97316', Comparison: '#64748b',
};
const TableOfContents = ({ items, bodyRef }) => {
  const [active, setActive] = useState(items[0]?.id || '');

  useEffect(() => {
    if (!bodyRef.current || !items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      {
        rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80')}px 0px -60% 0px`,
        threshold: 0,
      }
    );

    items.forEach(({ id }) => {
      const el = bodyRef.current?.querySelector(`#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items, bodyRef]);

  const handleClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const navH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '80'
    );
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    setActive(id);
  };

  if (!items.length) return null;

  return (
    <nav className={styles.toc}>
      <div className={styles.tocTitle}>Contents</div>
      <ul className={styles.tocList}>
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? styles.tocSubItem : styles.tocItem}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`${styles.tocLink} ${active === item.id ? styles.tocLinkActive : ''}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};


const BlogDetail = () => {
  const { slug } = useParams();
  const { data, isLoading, error } = useBlogBySlug(slug);
  const bodyRef = useRef(null);
  const [tocItems, setTocItems] = useState([]);

  const blog = data?.data?.data;
  const contentType = blog?.contentType;

  const blogSchema = blog ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.excerpt,
    "image": blog.featuredImageUrl,
    "author": { "@type": "Organization", "name": "CampusGarh" },
    "publisher": {
      "@type": "Organization",
      "name": "CampusGarh",
      "logo": { "@type": "ImageObject", "url": "https://campusgarh.com/Campus%20png%20transparent-01.png" }
    },
    "datePublished": blog.publishedAt,
    "dateModified": blog.updatedAt,
    "url": `https://campusgarh.com/blogs/${blog.slug}`
  } : null;
  const { data: similarData } = useBlogs({ contentType, limit: 4 });
  const similarBlogs = (similarData?.data?.data?.data || []).filter(b => b?._id && b._id !== blog?._id).slice(0, 4);

  useEffect(() => {
    if (!blog) return;
    if (blog.tableOfContents?.length > 0) {
      setTocItems(blog.tableOfContents);
      return;
    }
    // Wait one tick for dangerouslySetInnerHTML to flush to the DOM
    const timer = setTimeout(() => {
      if (!bodyRef.current) return;
      const headings = bodyRef.current.querySelectorAll('h2, h3');
      const items = Array.from(headings).map((h, idx) => {
        if (!h.id) h.id = `heading-${idx}`;
        return { id: h.id, title: h.textContent.trim(), level: parseInt(h.tagName[1]) };
      });
      setTocItems(items);
    }, 50);
    return () => clearTimeout(timer);
  }, [blog]);


  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader size="lg" />
        <p>Loading article…</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}><FaNewspaper /></span>
        <h2>Article not found</h2>
        <p>We couldn't find this article.</p>
        <Link to="/news"><Button variant="primary">Browse News & Articles</Button></Link>
      </div>
    );
  }

  const ctColor = CONTENT_TYPE_COLORS[blog.contentType] || '#64748b';
  const hasSidebar = tocItems.length > 0
    || blog.relatedColleges?.length > 0
    || blog.relatedCourses?.length > 0
    || blog.relatedExams?.length > 0;

  return (
    <div className={styles.page}>
      <SEOHead
        title={blog?.title}
        description={blog?.excerpt}
        keywords={blog?.tags?.join(', ')}
        canonical={`https://campusgarh.com/blogs/${blog?.slug}`}
        image={blog?.featuredImageUrl}
        type="article"
        schema={blogSchema}
      />
      {/* ── HERO ── */}

      <section className={styles.hero}>
        <div className={styles.heroNoise} />
        <div className={styles.heroInner}>
          
        <ShareButtons
          url={`https://campusgarh.com/news/${blog.slug}`}
          title={blog.title}
          image={blog.featuredImageUrl}
        />
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/news">News & Articles</Link>
            {blog.categories?.[0] && (
              <>
                <span>/</span>
                <Link to={`/news?category=${blog.categories[0]._id}`}>
                  {blog.categories[0].name}
                </Link>
              </>
            )}
            <span>/</span>
            <span>{blog.title}</span>
          </nav>

          {/* Meta badges */}
          <div className={styles.metaBadges}>
            {blog.contentType && (
              <span className={styles.contentTypeBadge} style={{ background: ctColor }}>
                {blog.contentType}
              </span>
            )}
            {blog.difficulty && (
              <span className={styles.difficultyBadge}>{blog.difficulty}</span>
            )}
            {blog.series?.name && (
              <span className={styles.seriesBadge}>
                Part {blog.series.partNumber} of {blog.series.totalParts}: {blog.series.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className={styles.title}>{blog.title}</h1>

          {/* Meta info */}
          <div className={styles.meta}>
            <span className={styles.date}>{formatDate(blog.publishedAt, 'dd MMM yyyy')}</span>
            {blog.readingTime && <span className={styles.readTime}>· {blog.readingTime} min read</span>}
            <span className={styles.author}>· By {blog.author?.name || 'Admin'}</span>
            {blog.lastReviewedAt && (
              <span className={styles.reviewed}>
                · Reviewed {formatDate(blog.lastReviewedAt, 'dd MMM yyyy')}
              </span>
            )}
          </div>

          {/* Categories */}
          {blog.categories?.length > 0 && (
            <div className={styles.categories}>
              {blog.categories.map((cat) => (
                <Link key={cat._id} to={`/news?category=${cat._id}`} className={styles.category}>
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className={styles.tags}>
              {blog.tags.map((tag) => (
                <Link key={tag} to={`/news?tag=${tag}`} className={styles.tag}>#{tag}</Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image — inside hero, below text */}
        {(blog.featuredImage?.url || blog.featuredImageUrl) && (
          <div className={styles.heroImage}>
            <img src={blog.featuredImage?.url || blog.featuredImageUrl} alt={blog.title} />
          </div>
        )}
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────────── */}
      <div className={styles.contentWrap}>
        <div className={styles.contentInner}>
          <div className={`${styles.layout} ${hasSidebar ? styles.withSidebar : ''}`}>
            {/* Main Article */}
            <article className={styles.main}>
              <div ref={bodyRef} className={styles.body} dangerouslySetInnerHTML={{ __html: parseMarkdown(blog.content) }} />

              {blog.relatedBlogs?.length > 0 && (
                <div className={styles.related}>
                  <h3>Related Articles</h3>
                  <div className={styles.relatedGrid}>
                    {blog.relatedBlogs.map((related) => (
                      <Link key={related._id} to={`/news/${related.slug}`} className={styles.relatedCard}>
                        <h4>{related.title}</h4>
                        <span>{formatDate(related.publishedAt, 'dd MMM yyyy')}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            {hasSidebar && (
              <aside className={styles.sidebar}>
                {tocItems.length > 0 && <TableOfContents items={tocItems} bodyRef={bodyRef} />}

                {blog.relatedColleges?.length > 0 && (
                  <div className={styles.sideSection}>
                    <div className={styles.sideSectionTitle}>Related Colleges</div>
                    {blog.relatedColleges.map((c) => (
                      <Link key={c._id} to={`/colleges/${c.slug}`} className={styles.sideLink}>
                        🏛️ {c.name}
                      </Link>
                    ))}
                  </div>
                )}

                {blog.relatedCourses?.length > 0 && (
                  <div className={styles.sideSection}>
                    <div className={styles.sideSectionTitle}>Related Courses</div>
                    {blog.relatedCourses.map((c) => (
                      <Link key={c._id} to={`/courses/${c.slug}`} className={styles.sideLink}>
                        🎓 {c.name}
                      </Link>
                    ))}
                  </div>
                )}

                {blog.relatedExams?.length > 0 && (
                  <div className={styles.sideSection}>
                    <div className={styles.sideSectionTitle}>Related Exams</div>
                    {blog.relatedExams.map((e) => (
                      <Link key={e._id} to={`/exams/${e.slug}`} className={styles.sideLink}>
                        📝 {e.name}
                      </Link>
                    ))}
                  </div>
                )}
              </aside>
            )}
          </div>
        </div>
      </div>
      {similarBlogs.length > 0 && (
      <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1C1C1E' }}>
          You May Also Like
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
          {similarBlogs.map(b => <BlogCard key={b._id} blog={b} />)}
        </div>
      </div>
    )}

    </div>
  );
};

export default BlogDetail;
