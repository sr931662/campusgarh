import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/queries';
import Card from '../common/Card/Card';
import Button from '../common/Button/Button';
import styles from './ForgotPassword.module.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { mutate: forgotPassword, isPending, isSuccess, error } = useForgotPassword();

  const onSubmit = (data) => {
    forgotPassword(data.email);
  };

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <Card padding="lg" className={styles.card}>
          <div className={styles.success}>
            <span className={styles.icon}>📧</span>
            <h2 className={styles.title}>Check your inbox</h2>
            <p className={styles.subtitle}>
              If an account exists with that email, we've sent a password reset link.
            </p>
            <Link to="/login" className={styles.backToLogin}>
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card padding="lg" className={styles.card}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={errors.email ? styles.error : ''}
              disabled={isPending}
              autoComplete="email"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth loading={isPending}>
            Send reset link
          </Button>

          <div className={styles.backToLogin}>
            <Link to="/login">← Back to login</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;