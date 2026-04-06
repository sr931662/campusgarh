import { useState } from 'react';
import { FaThumbsUp, FaFlag } from 'react-icons/fa';
import { useAuth } from '../../store/authStore';
import {
  useCollegeReviews,
  useAverageRating,
  useCreateReview,
  useMarkHelpful,
  useFlagReview,
} from '../../hooks/queries';
import RatingStars from '../common/RatingStars/RatingStars';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import ReviewForm from './ReviewForm';
import styles from './CollegeReviews.module.css';
import { formatRelativeTime } from '../../utils/formatters';

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

const roleLabel = {
  student: 'Student',
  alumni: 'Alumni',
  counsellor: 'Counsellor',
};


const PAGE_SIZE = 5;

const CollegeReviews = ({ collegeId }) => {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data: reviewsData, isLoading: reviewsLoading } = useCollegeReviews(collegeId, { page: 1, limit });
  const { data: ratingData } = useAverageRating(collegeId);

  const createReviewMutation = useCreateReview();
  const markHelpfulMutation = useMarkHelpful();
  const flagReviewMutation = useFlagReview();

  const reviews = reviewsData?.data?.data?.data || [];
  const totalReviews = reviewsData?.data?.data?.pagination?.total ?? 0;
  const { avgRating = 0, count: ratingCount = 0 } = ratingData?.data?.data || {};

  const handleSubmitReview = async (data) => {
    try {
      await createReviewMutation.mutateAsync({ ...data, college: collegeId });
      setShowForm(false);
    } catch {
      // error handled by the mutation hook (toast)
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Student Reviews</h2>
        {isAuthenticated && user?.role === 'student' && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <ReviewForm onSubmit={handleSubmitReview} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {reviewsLoading ? (
        <Loader />
      ) : ratingCount === 0 ? (
        <div className={styles.noReviews}>No reviews yet. Be the first to review!</div>
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.ratingSummary}>
              <span className={styles.averageRating}>{avgRating.toFixed(1)}</span>
              <RatingStars rating={avgRating} size="md" />
              <span className={styles.totalReviews}>Based on {ratingCount} reviews</span>
            </div>
          </div>

          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review._id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  {/* Avatar */}
                  <div className={styles.reviewerAvatar}>
                    {getInitials(review.user?.name)}
                  </div>

                  {/* Name + details */}
                  <div className={styles.reviewerMeta}>
                    <div className={styles.reviewerTopRow}>
                      <span className={styles.userName}>
                        {review.user?.name || 'CampusGarh User'}
                      </span>
                      {review.user?.role && (
                        <span className={styles.roleTag}>
                          {roleLabel[review.user.role] || review.user.role}
                        </span>
                      )}
                    </div>

                    {/* Academic info */}
                    {review.user?.academicBackground && (
                      <div className={styles.reviewerAcademic}>
                        {[
                          review.user.academicBackground.qualification,
                          review.user.academicBackground.stream,
                          review.user.academicBackground.institution,
                        ].filter(Boolean).join(' · ')}
                      </div>
                    )}

                    <span className={styles.reviewDate}>{formatRelativeTime(review.createdAt)}</span>
                  </div>

                  <RatingStars rating={review.rating} size="sm" />
                </div>

                <h3 className={styles.reviewTitle}>{review.title}</h3>
                <p className={styles.reviewContent}>{review.content}</p>
                {review.courseStudied && (
                  <div className={styles.courseStudied}>Course: {review.courseStudied}</div>
                )}

                <div className={styles.reviewFooter}>
                  <button
                    className={`${styles.helpfulBtn} ${review.helpfulBy?.some(id => String(id) === String(user?._id)) ? styles.helpfulActive : ''}`}
                    onClick={() => isAuthenticated && markHelpfulMutation.mutate({ reviewId: review._id, collegeId })}
                    disabled={!isAuthenticated || markHelpfulMutation.isPending}
                  >
                    <FaThumbsUp /> {review.helpfulCount || 0}
                  </button>
                  <button
                    className={styles.flagBtn}
                    onClick={() => isAuthenticated && flagReviewMutation.mutate(review._id)}
                    disabled={!isAuthenticated}
                  >
                    <FaFlag /> Report
                  </button>
                </div>
              </div>

            ))}
          </div>

          {reviews.length < totalReviews && (
            <div className={styles.viewMore}>
              <Button
                variant="outline"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={reviewsLoading}
              >
                Load More Reviews ({reviews.length} of {totalReviews})
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollegeReviews;
