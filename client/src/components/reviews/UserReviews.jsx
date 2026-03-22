import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../../services/reviewService';
import RatingStars from '../common/RatingStars/RatingStars';
import Loader from '../common/Loader/Loader';
import styles from './UserReviews.module.css';
import { formatDate } from '../../utils/formatters';

const UserReviews = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userReviews'],
    queryFn: reviewService.getUserReviews,
  });

  if (isLoading) return <Loader />;
  if (error) return <div className={styles.error}>Error loading your reviews</div>;

  const reviews = data?.data?.data || [];

  if (reviews.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>My Reviews</h3>
        <div className={styles.noReviews}>You haven't written any reviews yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>My Reviews</h3>
      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review._id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div>
                <h4>{review.title}</h4>
                <RatingStars rating={review.rating} size="sm" />
              </div>
              <div className={styles.reviewMeta}>
                <span>{formatDate(review.createdAt)}</span>
                <span className={`${styles.status} ${styles[review.status]}`}>
                  {review.status}
                </span>
              </div>
            </div>
            <p className={styles.reviewContent}>{review.content}</p>
            <div className={styles.collegeInfo}>
              {review.college?.name}
            </div>
            {review.status === 'rejected' && review.moderationNotes && (
              <div className={styles.modNotes}>Moderator note: {review.moderationNotes}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;