import { useState } from 'react';
import styles from './CollegeCutoffs.module.css';

const CATEGORIES = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'];

const catClass = {
  General: styles.catGeneral,
  OBC:     styles.catOBC,
  SC:      styles.catSC,
  ST:      styles.catST,
  EWS:     styles.catEWS,
  PwD:     styles.catPwD,
};

export default function CollegeCutoffs({ college }) {
  const cutoffs = college?.cutoffs || [];
  const [yearFilter, setYearFilter] = useState('All');
  const [catFilter,  setCatFilter]  = useState('All');

  const years = ['All', ...Array.from(new Set(cutoffs.map(c => c.year).filter(Boolean))).sort((a, b) => b - a).map(String)];

  const filtered = cutoffs.filter(c => {
    if (yearFilter !== 'All' && String(c.year) !== yearFilter) return false;
    if (catFilter  !== 'All' && c.category !== catFilter)       return false;
    return true;
  });

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Cutoffs</h2>
      <p className={styles.note}>Opening and closing ranks for admission cutoffs.</p>

      {cutoffs.length === 0 ? (
        <p className={styles.emptyMsg}>No cutoff data available yet.</p>
      ) : (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            {years.length > 2 && (
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Year</span>
                <div className={styles.filterBtns}>
                  {years.map(y => (
                    <button key={y}
                      className={`${styles.filterBtn} ${yearFilter === y ? styles.filterBtnActive : ''}`}
                      onClick={() => setYearFilter(y)}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Category</span>
              <div className={styles.filterBtns}>
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    className={`${styles.filterBtn} ${catFilter === cat ? styles.filterBtnActive : ''}`}
                    onClick={() => setCatFilter(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Exam</th>
                  <th>Year</th>
                  <th>Category</th>
                  <th>Opening Rank</th>
                  <th>Closing Rank</th>
                  <th>Round</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No matching cutoffs</td></tr>
                ) : filtered.map((c, i) => (
                  <tr key={i}>
                    <td>{c.course?.name || c.course || '—'}</td>
                    <td>{c.exam?.name   || c.exam   || '—'}</td>
                    <td>{c.year || '—'}</td>
                    <td>
                      <span className={`${styles.catBadge} ${catClass[c.category] || ''}`}>
                        {c.category || '—'}
                      </span>
                    </td>
                    <td>{c.openingRank ?? '—'}</td>
                    <td>{c.closingRank ?? '—'}</td>
                    <td>{c.round || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}