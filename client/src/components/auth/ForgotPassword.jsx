import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForgotPassword } from '../../hooks/queries';
import { forgotPasswordValidationSchema } from '../../utils/validators';
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setSubmitted(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <Card className={styles.card} padding="lg">
          <h2 className={styles.title}>Check Your Email</h2>
          <p className={styles.subtitle}>
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
          <div className={styles.backToLogin}>
            <Link to="/login">Back to Login</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card} padding="lg">
        <h2 className={styles.title}>Forgot Password?</h2>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={errors.email ? styles.error : ''}
              placeholder="you@example.com"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={forgotPasswordMutation.isPending}
            disabled={forgotPasswordMutation.isPending}
          >
            Send Reset Link
          </Button>

          <div className={styles.backToLogin}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;