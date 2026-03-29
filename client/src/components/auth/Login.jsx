import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLogin } from '../../hooks/queries';
import { loginValidationSchema } from '../../utils/validators';
import Button from '../common/Button/Button';
import Card from '../common/Card/Card';
import styles from './Login.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';


const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const stateMessage = location.state?.message;
  const { setAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authService.googleAuth(credentialResponse.credential);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Signed in with Google!');
      if (user.role === 'admin')           navigate('/dashboard/admin');
      else if (user.role === 'counsellor') navigate('/dashboard/counsellor');
      else if (user.role === 'moderator')  navigate('/dashboard/moderator');
      else                                 navigate('/dashboard/student');
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const { user } = result.data.data;
      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'counsellor') navigate('/dashboard/counsellor');
      else if (user.role === 'moderator') navigate('/dashboard/moderator');
      else if (user.role === 'institution_rep') navigate('/dashboard/institution-rep');
      else navigate('/dashboard/student');
    } catch (error) {
      // Error is already handled by the mutation's onError
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} padding="lg">
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Login to your CampusGarh account</p>

        {stateMessage && (
          <div className={styles.successBanner}>{stateMessage}</div>
        )}

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

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
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

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
          >
            Login
          </Button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.googleBtn}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed.')}
              // useOneTap
              text="signin_with"
              shape="rectangular"
            />
          </div>



          <div className={styles.registerLink}>
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;