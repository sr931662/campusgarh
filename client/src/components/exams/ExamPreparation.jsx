import React from 'react';
import styles from './ExamPreparation.module.css';

const SUBJECT_COLORS = ['#ebf5fb', '#fef9e7', '#eafaf1', '#f3e5f5', '#fce4ec', '#e8f5e9'];
const SUBJECT_TEXT_COLORS = ['#1a5276', '#7d6608', '#1e8449', '#6a1b9a', '#880e4f', '#2e7d32'];

const ExamPreparation = ({ preparationTips = [], recommendedBooks = [] }) => {
  if (preparationTips.length === 0 && recommendedBooks.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>Preparation Tips</h2>
        <p className={styles.emptyMsg}>Preparation tips not available yet.</p>
      </div>
    );
  }

  const grouped = preparationTips.reduce((acc, tip) => {
    const cat = tip.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tip.tip);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <div className={styles.wrapper}>
      {preparationTips.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Preparation Tips</h2>
          <div className={styles.tipsGrid}>
            {categories.map((cat, idx) => (
              <div key={cat} className={styles.tipCard} style={{ borderTop: `4px solid ${SUBJECT_TEXT_COLORS[idx % SUBJECT_TEXT_COLORS.length]}`, background: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}>
                <h3 className={styles.tipCategory} style={{ color: SUBJECT_TEXT_COLORS[idx % SUBJECT_TEXT_COLORS.length] }}>{cat}</h3>
                <ul className={styles.tipList}>
                  {grouped[cat].map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}

      {recommendedBooks.length > 0 && (
        <>
          <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Recommended Books</h2>
          <div className={styles.booksGrid}>
            {recommendedBooks.map((book, idx) => (
              <div key={idx} className={styles.bookCard}>
                <div className={styles.bookIcon}>📚</div>
                <div className={styles.bookInfo}>
                  <div className={styles.bookTitle}>{book.title}</div>
                  {book.author && <div className={styles.bookAuthor}>by {book.author}</div>}
                  {book.subject && <span className={styles.bookSubject}>{book.subject}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExamPreparation;
