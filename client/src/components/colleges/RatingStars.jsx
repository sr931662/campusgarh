import React from 'react';
import styles from './RatingStars.module.css';

const RatingStars = ({ rating, size = 'md', showNumber = false }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`${styles.stars} ${styles[size]}`}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={styles.starFull}>★</span>
      ))}
      {hasHalfStar && <span className={styles.starHalf}>★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.starEmpty}>★</span>
      ))}
      {showNumber && <span className={styles.ratingNumber}>{rating.toFixed(1)}</span>}
    </div>
  );
};

export default RatingStars;