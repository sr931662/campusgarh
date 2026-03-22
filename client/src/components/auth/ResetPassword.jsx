import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useResetPassword } from '../../hooks/queries';
import { resetPasswordValidationSchema } from '../../utils/validators';
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      await resetPasswordMutation.mutateAsync({ token, password: data.password });
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <Card className={styles.card} padding="lg">
          <h2 className={styles.title}>Password Reset Successful</h2>
          <p className={styles.subtitle}>
            Your password has been reset successfully. You will be redirected to login shortly.
          </p>
          <div className={styles.backToLogin}>
            <Link to="/login">Go to Login</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card} padding="lg">
        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.subtitle}>Please enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={errors.password ? styles.error : ''}
                placeholder="••••••"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? styles.error : ''}
                placeholder="••••••"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword.message}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={resetPasswordMutation.isPending}
            disabled={resetPasswordMutation.isPending}
          >
            Reset Password
          </Button>

          <div className={styles.backToLogin}>
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;