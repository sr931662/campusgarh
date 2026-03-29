import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../../hooks/queries';
import styles from './Register.module.css';
import Button from '../common/Button/Button';
import { ROLES } from '../../utils/constants';
import { FaEye, FaEyeSlash, FaUniversity, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';


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
  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT);

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
    { value: ROLES.STUDENT, label: 'Student', icon: FaUserGraduate, description: 'Looking for colleges, courses, and career guidance' },
    { value: ROLES.INSTITUTION_REP, label: 'Institution Representative', icon: FaUniversity, description: "Manage your college's listings and enquiries" },
    { value: ROLES.COUNSELLOR, label: 'Counsellor / Advisor', icon: FaChalkboardTeacher, description: 'Help students with admissions and career advice' },
  ];

  return (
    <div className={styles.container}>
      <div className={`card ${styles.card}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create an Account</h1>
          <p className={styles.subtitle}>Join CampusGarh and find your perfect college</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {/* Name Field */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={errors.name ? styles.error : ''}
              placeholder="e.g., John Doe"
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name.message}</span>}
          </div>

          {/* Email Field */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={errors.email ? styles.error : ''}
              placeholder="you@example.com"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
          </div>

          {/* Phone Field */}
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number (optional)</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={errors.phone ? styles.error : ''}
              placeholder="10-digit mobile number"
            />
            {errors.phone && <span className={styles.errorMsg}>{errors.phone.message}</span>}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={errors.password ? styles.error : ''}
                placeholder="••••••"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
            <small className={styles.hint}>At least 6 characters with one letter and one number</small>
          </div>

          {/* Confirm Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? styles.error : ''}
                placeholder="••••••"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <span className={styles.errorMsg}>{errors.confirmPassword.message}</span>}
          </div>

          {/* Role Selection */}
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
            <small className={styles.hint}>
              * Students get access to personalised college recommendations and reviews.<br />
              * Institution reps and counsellors can manage listings and enquiries.
            </small>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            className={styles.submitBtn}
          >
            Create Account
          </Button>
          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.googleBtn}>
            // Remove the width prop entirely
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed.')}
              useOneTap
              text="signin_with"
              shape="rectangular"
            />

          </div>

        </form>
        

        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;