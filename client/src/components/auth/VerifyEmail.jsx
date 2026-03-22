import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Card from '../common/Card/Card';
import Loader from '../common/Loader/Loader';
import styles from './VerifyEmail.module.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  // Auto-redirect to /login after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown === 0) {
      navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, navigate]);

  if (status === 'loading') return <Loader />;

  return (
    <div className={styles.container}>
      <Card className={styles.card} padding="lg">
        {status === 'success' ? (
          <>
            <span className={styles.icon}>✅</span>
            <h2 className={styles.title}>Email Verified!</h2>
            <p className={styles.subtitle}>
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <p className={styles.countdown}>Redirecting in {countdown}s...</p>
          </>
        ) : (
          <>
            <span className={styles.icon}>❌</span>
            <h2 className={styles.title}>Verification Failed</h2>
            <p className={styles.subtitle}>
              This verification link is invalid or has expired. Please register again or contact support.
            </p>
          </>
        )}
        <div className={styles.backToLogin}>
          <Link to="/login">Go to Login</Link>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
