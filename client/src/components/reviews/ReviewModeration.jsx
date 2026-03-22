import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { reviewService } from '../../services/reviewService';
import { REVIEW_STATUS } from '../../utils/constants';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import RatingStars from '../common/RatingStars/RatingStars';
import styles from './ReviewModeration.module.css';
import { formatDate } from '../../utils/formatters';

const ReviewModeration = () => {
  const [filter, setFilter] = useState(REVIEW_STATUS.PENDING);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', filter],
    queryFn: () => reviewService.getAllReviews({ status: filter, page: 1, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  const moderateMutation = useMutation({
    mutationFn: ({ reviewId, status, notes }) => reviewService.moderateReview(reviewId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const handleModerate = (reviewId, status, notes = '') => {
    moderateMutation.mutate({ reviewId, status, notes });
  };

  if (isLoading) return <Loader />;
  if (error) return <div className={styles.error}>Error loading reviews</div>;

  const reviews = data?.data?.data?.data || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Review Moderation</h2>
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === REVIEW_STATUS.PENDING ? styles.active : ''}`}
            onClick={() => setFilter(REVIEW_STATUS.PENDING)}
          >
            Pending
          </button>
          <button
            className={`${styles.filterBtn} ${filter === REVIEW_STATUS.APPROVED ? styles.active : ''}`}
            onClick={() => setFilter(REVIEW_STATUS.APPROVED)}
          >
            Approved
          </button>
          <button
            className={`${styles.filterBtn} ${filter === REVIEW_STATUS.REJECTED ? styles.active : ''}`}
            onClick={() => setFilter(REVIEW_STATUS.REJECTED)}
          >
            Rejected
          </button>
          <button
            className={`${styles.filterBtn} ${filter === REVIEW_STATUS.FLAGGED ? styles.active : ''}`}
            onClick={() => setFilter(REVIEW_STATUS.FLAGGED)}
          >
            Flagged
          </button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.noReviews}>No reviews found</div>
      ) : (
        <div className={styles.reviewsList}>
          {reviews.map((review) => (
            <div key={review._id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <h3>{review.title}</h3>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <div className={styles.reviewMeta}>
                  <span>By {review.user?.name || 'Anonymous'}</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
              <p className={styles.reviewContent}>{review.content}</p>
              {review.college && (
                <div className={styles.collegeInfo}>
                  College: {review.college.name}
                </div>
              )}
              {review.moderationNotes && (
                <div className={styles.modNotes}>Moderator notes: {review.moderationNotes}</div>
              )}
              <div className={styles.actions}>
                {filter === REVIEW_STATUS.PENDING && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleModerate(review._id, REVIEW_STATUS.APPROVED)}
                      loading={moderateMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleModerate(review._id, REVIEW_STATUS.REJECTED)}
                      loading={moderateMutation.isPending}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {filter === REVIEW_STATUS.FLAGGED && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModerate(review._id, REVIEW_STATUS.APPROVED, 'Flag cleared')}
                  >
                    Clear Flag & Approve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;