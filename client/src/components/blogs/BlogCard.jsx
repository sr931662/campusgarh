import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Card from '../common/Card/Card';
import styles from './BlogCard.module.css';
import { formatDate, truncateText } from '../../utils/formatters';

const CONTENT_TYPE_COLORS = {
  Guide: '#3b82f6', News: '#f59e0b', Ranking: '#8b5cf6',
  'College Review': '#10b981', 'Exam Update': '#ef4444',
  'Career Advice': '#0891b2', Scholarship: '#f97316', Comparison: '#64748b',
};

const BlogCard = ({ blog }) => {
  const { title, slug, excerpt, featuredImage, featuredImageUrl, publishedAt, readingTime, author, categories, contentType, series } = blog;
  const coverImage = featuredImage?.url || featuredImageUrl || null;
  const label = contentType || categories?.[0]?.name || 'Article';
  const badgeColor = CONTENT_TYPE_COLORS[contentType] || '#C9A84C';
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <Link to={`/news/${slug}`} className={styles.link}>
      <Card hover className={styles.card}>
        {/* Image */}
        <div className={styles.imageWrap}>
          {coverImage
            ? <img src={coverImage} alt={title} className={styles.image} />
            : <div className={styles.imagePlaceholder}><FaNewspaper /></div>
          }
          <span className={styles.badge} style={{ background: badgeColor }}>{label}</span>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {categories?.length > 0 && (
            <div className={styles.categories}>
              {categories.slice(0, 2).map(cat => (
                <span key={cat._id} className={styles.category}>{cat.name}</span>
              ))}
            </div>
          )}

          {series?.name && (
            <div className={styles.seriesLabel}>Part {series.partNumber} · {series.name}</div>
          )}

          <h3 className={styles.title}>{title}</h3>
          {excerpt && <p className={styles.excerpt}>{truncateText(excerpt, 110)}</p>}

          <div className={styles.meta}>
            {date && (
              <span className={styles.metaItem}>
                <FaCalendarAlt className={styles.metaIcon} />{date}
              </span>
            )}
            {readingTime && (
              <span className={styles.metaItem}>
                <FaClock className={styles.metaIcon} />{readingTime} min
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
