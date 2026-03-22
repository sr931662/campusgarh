import React, { useState, useMemo } from 'react';
import styles from './ExamCutoffs.module.css';

const CATEGORIES = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'];

const ExamCutoffs = ({ examCutoffs = [] }) => {
  const years = useMemo(() => {
    const ys = [...new Set(examCutoffs.map((c) => c.year).filter(Boolean))].sort((a, b) => b - a);
    return ['All', ...ys];
  }, [examCutoffs]);

  const [selectedYear, setSelectedYear] = useState(String(years[1] || years[0] || 'All'));
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = examCutoffs.filter((c) => {
    const yearMatch = selectedYear === 'All' || c.year === Number(selectedYear);
    const catMatch = selectedCategory === 'All' || c.category === selectedCategory;
    return yearMatch && catMatch;
  });

  if (examCutoffs.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>Previous Year Cutoffs</h2>
        <p className={styles.emptyMsg}>Cutoff data not available yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Previous Year Cutoffs</h2>
      <p className={styles.note}>Cutoffs are indicative. Refer to the official website for verified data.</p>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Year</label>
          <div className={styles.filterBtns}>
            {years.map((y) => (
              <button key={y} className={`${styles.filterBtn} ${selectedYear === String(y) ? styles.active : ''}`} onClick={() => setSelectedYear(String(y))}>{y}</button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <div className={styles.filterBtns}>
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`${styles.filterBtn} ${selectedCategory === cat ? styles.active : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr><th>Year</th><th>Category</th><th>Paper</th><th>Cutoff Score</th><th>Cutoff Rank</th></tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.year}</td>
                  <td><span className={styles.catBadge}>{c.category}</span></td>
                  <td>{c.paper || '—'}</td>
                  <td>{c.cutoffScore ?? '—'}</td>
                  <td>{c.cutoffRank?.toLocaleString() ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.emptyMsg}>No cutoff data for selected filters.</p>
      )}
    </div>
  );
};

export default ExamCutoffs;
