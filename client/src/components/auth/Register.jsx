import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../../hooks/queries';
import styles from './Register.module.css';
import { ROLES } from '../../utils/constants';
import { FaEye, FaEyeSlash, FaUniversity, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import logo from '../../assets/Campus white color logo png-01.png';

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'Password must contain at least one letter and one number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits').optional(),
  role: yup.string().oneOf([ROLES.STUDENT, ROLES.INSTITUTION_REP, ROLES.COUNSELLOR], 'Invalid role').required('Please select a role'),
});

const Register = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { role: ROLES.STUDENT }
  });

  const { setAuth } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await authService.googleAuth(credentialResponse.credential);
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success('Account created with Google!');
      navigate('/dashboard/student');
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const watchedRole = watch('role');

  const onSubmit = (data) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => navigate('/login', { state: { registered: true } })
    });
  };

  const roleOptions = [
    { value: ROLES.STUDENT, label: 'Student', icon: FaUserGraduate, description: 'Find colleges & courses' },
    { value: ROLES.INSTITUTION_REP, label: 'Institution Rep', icon: FaUniversity, description: 'Manage your college' },
    { value: ROLES.COUNSELLOR, label: 'Counsellor', icon: FaChalkboardTeacher, description: 'Guide students' },
  ];

  return (
    <div className={styles.container}>
      {/* ── LEFT PANEL ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          
          <Link to="/" className={styles.brandLink}>
            <img src={logo} alt="CampusGarh" style={{ height: '150px', width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div className={styles.leftBody}>
            <h2 className={styles.leftHeading}>
              Join 10 lakh+<br />students already<br />on CampusGarh.
            </h2>
            <p className={styles.leftSub}>
              Create a free account and unlock personalised college recommendations, expert counselling, and more.
            </p>
            <div className={styles.leftBullets}>
              {[
                'Access 5,000+ college profiles',
                'Compare colleges side-by-side',
                'Get free expert counselling',
                'Track entrance exams & cutoffs',
              ].map((b) => (
                <div key={b} className={styles.leftBullet}>
                  <span className={styles.leftBulletDot} />
                  {b}
                </div>
              ))}
            </div>
          </div>
          <p className={styles.leftFooter}>© 2025 CampusGarh</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className={styles.card}>
        <div className={styles.formInner}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create an account</h1>
            <p className={styles.subtitle}>Free forever · No credit card needed</p>
          </div>

          <div className={styles.googleBtn}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed.')}
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          <div className={styles.divider}><span>or sign up with email</span></div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* Name */}
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" {...register('name')} className={errors.name ? styles.error : ''} placeholder="e.g., Shivam Kumar" autoComplete="name" />
              {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" {...register('email')} className={errors.email ? styles.error : ''} placeholder="you@example.com" autoComplete="email" />
              {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
            </div>

            {/* Phone */}
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
              <input id="phone" type="tel" {...register('phone')} className={errors.phone ? styles.error : ''} placeholder="10-digit mobile number" />
              {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} className={errors.password ? styles.error : ''} placeholder="Min. 6 chars with a number" autoComplete="new-password" />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={styles.passwordWrapper}>
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} {...register('confirmPassword')} className={errors.confirmPassword ? styles.error : ''} placeholder="••••••••" autoComplete="new-password" />
                <button type="button" className={styles.togglePassword} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword.message}</span>}
            </div>

            {/* Role */}
            <div className={styles.formGroup}>
              <label>I am a</label>
              <div className={styles.roleGroup}>
                {roleOptions.map(role => {
                  const Icon = role.icon;
                  const isSelected = watchedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      className={`${styles.roleCard} ${isSelected ? styles.roleCardActive : ''}`}
                      onClick={() => setValue('role', role.value, { shouldValidate: true })}
                    >
                      <Icon className={styles.roleIcon} />
                      <div className={styles.roleLabel}>{role.label}</div>
                      <div className={styles.roleDesc}>{role.description}</div>
                    </button>
                  );
                })}
              </div>
              {errors.role && <span className={styles.errorMsg}>{errors.role.message}</span>}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <div className={styles.loginLink}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
