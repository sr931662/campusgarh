import React, { useState } from 'react';
import Button from '../common/Button/Button';
import styles from './BlogFilters.module.css';

const BlogFilters = ({ filters, onFilterChange, onReset, categories, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  return (
    <div className={styles.filters}>
      {onClose && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.75rem 1rem 0' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '50px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      )}
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <button className={styles.resetBtn} onClick={handleReset}>
          Reset All
        </button>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Category</label>
        <select
          value={localFilters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className={styles.select}
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Content Type</label>
        <select
          value={localFilters.contentType || ''}
          onChange={(e) => handleChange('contentType', e.target.value)}
          className={styles.select}
        >
          <option value="">All Types</option>
          <option value="Guide">Guide</option>
          <option value="News">News</option>
          <option value="Ranking">Ranking</option>
          <option value="College Review">College Review</option>
          <option value="Exam Update">Exam Update</option>
          <option value="Career Advice">Career Advice</option>
          <option value="Scholarship">Scholarship</option>
          <option value="Comparison">Comparison</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Tag</label>
        <input
          type="text"
          value={localFilters.tag || ''}
          onChange={(e) => handleChange('tag', e.target.value)}
          placeholder="e.g., entrance-exam"
          className={styles.input}
        />
      </div>

      <Button variant="primary" size="md" fullWidth onClick={() => onFilterChange(localFilters)}>
        Apply Filters
      </Button>
    </div>
  );
};

export default BlogFilters;