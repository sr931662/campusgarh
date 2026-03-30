import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FaNewspaper, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { blogService } from '../../services/blogService';
import styles from './LatestArticles.module.css';

const TYPE_COLORS = {
  Guide: '#3b82f6', News: '#f59e0b', Ranking: '#8b5cf6',
  'College Review': '#10b981', 'Exam Update': '#ef4444',
  'Career Advice': '#0891b2', Scholarship: '#f97316', Comparison: '#64748b',
};

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const ArticleCard = ({ blog }) => {
  const label = blog.contentType || blog.categories?.[0]?.name || 'Article';
  const color = TYPE_COLORS[blog.contentType] || 'var(--gold, #C9A84C)';
  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <motion.div variants={fadeUp}>
      <Link to={`/blogs/${blog.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {blog.featuredImage?.url ? (
            <img src={blog.featuredImage.url} alt={blog.title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}><FaNewspaper /></div>
          )}
          <span className={styles.badge} style={{ background: color }}>{label}</span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{blog.title}</h3>
          {blog.excerpt && <p className={styles.excerpt}>{blog.excerpt.slice(0, 110)}…</p>}
          <div className={styles.meta}>
            {date && (
              <span className={styles.metaItem}>
                <FaCalendarAlt className={styles.metaIcon} />{date}
              </span>
            )}
            {blog.readingTime && (
              <span className={styles.metaItem}>
                <FaClock className={styles.metaIcon} />{blog.readingTime} min read
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const LatestArticles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-blogs'],
    queryFn: () => blogService.getFeaturedBlogs(),
    staleTime: 5 * 60 * 1000,
  });

  const raw = data?.data?.data;
  const blogs = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  if (!isLoading && (error || blogs.length === 0)) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial="hidden" whileInView="visible"
          viewport={{ once: true }} variants={fadeUp}
        >
          <div>
            <p className={styles.eyebrow}>Knowledge Hub</p>
            <h2 className={styles.heading}>Latest Articles &amp; <span>Updates</span></h2>
            <p className={styles.sub}>Expert insights and admission guidance</p>
          </div>
          <Link to="/blogs" className={styles.viewAll}>View All →</Link>
        </motion.div>

        {isLoading ? (
          <div className={styles.skeletonRow}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <motion.div
            className={styles.grid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {blogs.map(blog => <ArticleCard key={blog._id} blog={blog} />)}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LatestArticles;
