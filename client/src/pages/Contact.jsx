import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEnquiry } from '../hooks/queries';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import styles from './Contact.module.css';

const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const createEnquiry = useCreateEnquiry();

  const onSubmit = async (data) => {
    await createEnquiry.mutateAsync(data);
    reset();
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you</p>
      </div>
      <div className={styles.content}>
        <Card padding="lg" className={styles.card}>
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
              <label>Message</label>
              <textarea rows="5" {...register('message')} />
            </div>
            <Button type="submit" variant="primary" fullWidth loading={createEnquiry.isPending}>
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;