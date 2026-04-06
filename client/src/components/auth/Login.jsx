import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLogin } from '../../hooks/queries';
import { loginValidationSchema } from '../../utils/validators';
import styles from './Login.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import logo from '../../assets/Campus white color logo png-01.png';

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
      else if (user.role === 'partner')    navigate('/partner/dashboard');
      else                                 navigate('/dashboard/student');
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await loginMutation.mutateAsync(data);
      const { user } = result.data.data;
      if (user.role === 'admin')               navigate('/dashboard/admin');
      else if (user.role === 'counsellor')     navigate('/dashboard/counsellor');
      else if (user.role === 'moderator')      navigate('/dashboard/moderator');
      else if (user.role === 'institution_rep') navigate('/dashboard/institution-rep');
      else if (user.role === 'partner')        navigate('/partner/dashboard');
      else                                     navigate('/dashboard/student');
    } catch {}
  };

  return (
    <div className={styles.page}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <Link to="/" className={styles.brandLink}>
            <img src={logo} alt="CampusGarh" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div className={styles.leftBody}>
            <h2 className={styles.leftHeading}>
              Your dream college<br />starts here.
            </h2>
            <p className={styles.leftSub}>
              5,000+ colleges · 200+ courses · Expert counselling — all free.
            </p>
            <div className={styles.leftStats}>
              {[['10L+', 'Students'],['5K+','Colleges'],['Free','Counselling']].map(([n,l]) => (
                <div key={l} className={styles.leftStat}>
                  <span className={styles.leftStatNum}>{n}</span>
                  <span className={styles.leftStatLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <p className={styles.leftFooter}>© 2025 CampusGarh</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrap}>

          <div className={styles.formHeader}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your account</p>
          </div>

          {stateMessage && (
            <div className={styles.successBanner}>{stateMessage}</div>
          )}

          {/* Google */}
          <div className={styles.googleBtn}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed.')}
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className={styles.divider}><span>or continue with email</span></div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={errors.email ? styles.inputError : styles.input}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={errors.password ? styles.inputError : styles.input}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className={styles.spinner} />
              ) : 'Sign in'}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account?{' '}
            <Link to="/register">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
