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

  return (
    <Link to={`/blogs/${slug}`} className={styles.link}>
      <Card hover className={styles.card}>
        {coverImage ? (
          <div className={styles.imageWrapper}>
            <img src={coverImage} alt={title} className={styles.image} />
          </div>
        ) : (
          <div className={styles.imagePlaceholder}><FaNewspaper /></div>
        )}
        <div className={styles.content}>
          <div className={styles.topRow}>
            <div className={styles.categories}>
              {categories?.slice(0, 2).map((cat) => (
                <span key={cat._id} className={styles.category}>{cat.name}</span>
              ))}
            </div>
            {contentType && (
              <span className={styles.contentType} style={{ background: CONTENT_TYPE_COLORS[contentType] || '#64748b' }}>
                {contentType}
              </span>
            )}
          </div>
          {series?.name && (
            <div className={styles.seriesLabel}>Part {series.partNumber} · {series.name}</div>
          )}
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.excerpt}>{truncateText(excerpt || '', 120)}</p>
          <div className={styles.meta}>
            {author?.name && <span className={styles.author}>{author.name}</span>}
            <span className={styles.date}>{formatDate(publishedAt, 'dd MMM yyyy')}</span>
            {readingTime && <span className={styles.readTime}>{readingTime} min read</span>}
            {difficulty && <span className={styles.difficulty}>{difficulty}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;