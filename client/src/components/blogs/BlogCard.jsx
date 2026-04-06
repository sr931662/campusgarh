import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaCalendarAlt, FaClock } from 'react-icons/fa';
import styles from './BlogCard.module.css';

const CONTENT_TYPE_COLORS = {
  Guide: '#3b82f6', News: '#f59e0b', Ranking: '#8b5cf6',
  'College Review': '#10b981', 'Exam Update': '#ef4444',
  'Career Advice': '#0891b2', Scholarship: '#f97316', Comparison: '#64748b',
};

const BlogCard = ({ blog }) => {
  const { title, slug, excerpt, featuredImage, featuredImageUrl, publishedAt, readingTime, series, categories, contentType } = blog;
  const coverImage = featuredImage?.url || featuredImageUrl || null;
  const label = contentType || categories?.[0]?.name || 'Article';
  const badgeColor = CONTENT_TYPE_COLORS[contentType] || '#C9A84C';
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link to={`/news/${slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {coverImage
          ? <img src={coverImage} alt={title} className={styles.image} />
          : <div className={styles.imagePlaceholder}><FaNewspaper /></div>
        }
        <span className={styles.badge} style={{ background: badgeColor }}>{label}</span>
      </div>

      <div className={styles.body}>
        {series?.name && (
          <div className={styles.seriesLabel}>Part {series.partNumber} · {series.name}</div>
        )}
        <h3 className={styles.title}>{title}</h3>
        {excerpt && <p className={styles.excerpt}>{excerpt.slice(0, 110)}…</p>}
        <div className={styles.meta}>
          {date && (
            <span className={styles.metaItem}>
              <FaCalendarAlt className={styles.metaIcon} />{date}
            </span>
          )}
          {readingTime && (
            <span className={styles.metaItem}>
              <FaClock className={styles.metaIcon} />{readingTime} min read
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
