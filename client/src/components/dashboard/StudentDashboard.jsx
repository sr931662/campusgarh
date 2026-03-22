import React from 'react';
import { FaUniversity, FaBook, FaStar, FaChartBar } from 'react-icons/fa';
import { useUserProfile } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import UserReviews from '../reviews/UserReviews';
import SavedColleges from './SavedColleges';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const { data: userData, isLoading, error } = useUserProfile();

  if (isLoading) return <Loader fullScreen />;
  if (error) return <div>Error loading profile</div>;

  const user = userData?.data?.data;

  if (!user) return <Loader fullScreen />;

  const stats = [
    { title: 'Saved Colleges', value: user.savedColleges?.length || 0, icon: <FaUniversity />, color: 'primary' },
    { title: 'Saved Courses',  value: user.savedCourses?.length  || 0, icon: <FaBook />,       color: 'success' },
    { title: 'Reviews Written',value: user.reviewsCount          || 0, icon: <FaStar />,        color: 'warning' },
    { title: 'Comparisons',    value: user.comparisonsCount      || 0, icon: <FaChartBar />,    color: 'danger'  },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Welcome back, {user.name}!</h1>
        <p>Track your college preferences and applications</p>
      </div>
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>
      <div className={styles.sections}>
        <div className={styles.section}>
          <SavedColleges colleges={user.savedColleges} />
        </div>
        <div className={styles.section}>
          <UserReviews />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;