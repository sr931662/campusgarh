import React from 'react';
import { Link } from 'react-router-dom';
import { FaNewspaper } from 'react-icons/fa';
import Card from '../common/Card/Card';
import styles from './BlogCard.module.css';
import { formatDate, truncateText } from '../../utils/formatters';

const CONTENT_TYPE_COLORS = {
  Guide: '#3b82f6', News: '#f59e0b', Ranking: '#8b5cf6',
  'College Review': '#10b981', 'Exam Update': '#ef4444',
  'Career Advice': '#0891b2', Scholarship: '#f97316', Comparison: '#64748b',
};

const BlogCard = ({ blog }) => {
  const { title, slug, excerpt, featuredImage, featuredImageUrl, publishedAt, readingTime, author, categories, contentType, difficulty, series } = blog;
  const coverImage = featuredImage?.url || featuredImageUrl || null;
  const badgeColor = CONTENT_TYPE_COLORS[contentType] || '#64748b';

  return (
    <Link to={`/news/${slug}`} className={styles.link}>
      <Card hover className={styles.card}>
        {/* Image / Placeholder */}
        <div className={styles.imageArea}>
          {coverImage ? (
            <img src={coverImage} alt={title} className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}><FaNewspaper /></div>
          )}
          {contentType && (
            <span className={styles.typeBadge} style={{ background: badgeColor }}>
              {contentType}
            </span>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {categories?.length > 0 && (
            <div className={styles.categories}>
              {categories.slice(0, 2).map((cat) => (
                <span key={cat._id} className={styles.category}>{cat.name}</span>
              ))}
            </div>
          )}

          {series?.name && (
            <div className={styles.seriesLabel}>Part {series.partNumber} · {series.name}</div>
          )}

          <h3 className={styles.title}>{title}</h3>
          {excerpt && <p className={styles.excerpt}>{truncateText(excerpt, 120)}</p>}

          <div className={styles.meta}>
            {author?.name && <span className={styles.author}>{author.name}</span>}
            <span>{formatDate(publishedAt, 'dd MMM yyyy')}</span>
            {readingTime && <span className={styles.readTime}>{readingTime} min read</span>}
            {difficulty && <span className={styles.difficulty}>{difficulty}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;
