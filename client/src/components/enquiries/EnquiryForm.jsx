import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEnquiry } from '../../hooks/queries';
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import styles from './EnquiryForm.module.css';

const EnquiryForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const createEnquiry = useCreateEnquiry();

  const onSubmit = async (data) => {
    await createEnquiry.mutateAsync(data);
    reset();
  };

  return (
    <Card padding="lg" className={styles.card}>
      <h2>Get Free Counselling</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input {...register('studentName', { required: 'Name is required' })} />
          {errors.studentName && <span>{errors.studentName.message}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })} />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Phone</label>
          <input type="tel" {...register('phone', { required: 'Phone is required' })} />
          {errors.phone && <span>{errors.phone.message}</span>}
        </div>
        <div className={styles.formGroup}>
          <label>Course Interest</label>
          <input {...register('courseInterest')} placeholder="e.g., B.Tech, MBA" />
        </div>
        <div className={styles.formGroup}>
          <label>College Interest</label>
          <input {...register('collegeInterest')} placeholder="College name (optional)" />
        </div>
        <div className={styles.formGroup}>
          <label>Message</label>
          <textarea {...register('message')} rows="4" />
        </div>
        <Button type="submit" variant="primary" fullWidth loading={createEnquiry.isPending}>
          Submit Enquiry
        </Button>
      </form>
    </Card>
  );
};

export default EnquiryForm;