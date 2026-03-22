import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import styles from './AdminDashboard.module.css';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: statsRes, isLoading, error } = useQuery({ queryKey: ['adminStats'], queryFn: adminService.getStats });

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading stats</div>;

  const stats = statsRes?.data?.data;

  const statItems = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'primary' },
    { title: 'Colleges', value: stats?.totalColleges || 0, icon: '🏛️', color: 'success' },
    { title: 'Courses', value: stats?.totalCourses || 0, icon: '📚', color: 'warning' },
    { title: 'Enquiries', value: stats?.totalEnquiries || 0, icon: '📞', color: 'danger' },
    { title: 'Pending Reviews', value: stats?.pendingReviews || 0, icon: '⭐', color: 'warning' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Platform overview and management</p>
      </div>
      <div className={styles.statsGrid}>
        {statItems.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link to="/admin/colleges/create" className={styles.actionCard}>Add College</Link>
          <Link to="/admin/courses/create" className={styles.actionCard}>Add Course</Link>
          <Link to="/admin/exams/create" className={styles.actionCard}>Add Exam</Link>
          <Link to="/admin/blogs/create" className={styles.actionCard}>Write Blog</Link>
          <Link to="/admin/import" className={styles.actionCard}>Import Data</Link>
          <Link to="/admin/reviews/moderation" className={styles.actionCard}>Moderate Reviews</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;