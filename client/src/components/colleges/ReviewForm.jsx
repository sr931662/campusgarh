import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { reviewValidationSchema } from '../../utils/validators';
import Button from '../common/Button/Button';
import RatingStars from '../common/RatingStars/RatingStars';
import styles from './ReviewForm.module.css';

const ReviewForm = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(reviewValidationSchema),
  });

  const handleRatingChange = (value) => {
    setRating(value);
    setValue('rating', value);
  };

  const submitHandler = (data) => {
    onSubmit({ ...data, rating });
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className={styles.form}>
      <h3 className={styles.title}>Write a Review</h3>

      <div className={styles.formGroup}>
        <label>Your Rating</label>
        <div className={styles.ratingSelector}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={styles.star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingChange(star)}
            >
              {star <= (hoverRating || rating) ? '★' : '☆'}
            </span>
          ))}
        </div>
        {errors.rating && <span className={styles.errorMsg}>{errors.rating.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Review Title</label>
        <input
          type="text"
          {...register('title')}
          className={errors.title ? styles.error : ''}
          placeholder="Summarize your experience"
        />
        {errors.title && <span className={styles.errorMsg}>{errors.title.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Your Review</label>
        <textarea
          rows="5"
          {...register('content')}
          className={errors.content ? styles.error : ''}
          placeholder="Share details about your experience..."
        />
        {errors.content && <span className={styles.errorMsg}>{errors.content.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label>Course Studied (Optional)</label>
        <input
          type="text"
          {...register('courseStudied')}
          placeholder="e.g., B.Tech Computer Science"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Graduation Year (Optional)</label>
        <input
          type="number"
          {...register('graduationYear')}
          placeholder="e.g., 2024"
        />
        {errors.graduationYear && <span className={styles.errorMsg}>{errors.graduationYear.message}</span>}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Submit Review
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;