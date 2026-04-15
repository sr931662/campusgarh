import React from 'react';
import { FaUsers, FaUniversity, FaBook, FaPhone, FaStar, FaChartBar, FaInbox } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { useAllEnquiries } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import styles from './AdminDashboard.module.css';
import { Link } from 'react-router-dom';

const CONVERSION_COLORS = {
  new: '#64748b', contacted: '#3b82f6', interested: '#10b981',
  not_interested: '#ef4444', converted: '#22c55e', lost: '#94a3b8',
};
const statusLabel = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const AdminDashboard = () => {
  const { data: statsRes, isLoading, error } = useQuery({ queryKey: ['adminStats'], queryFn: adminService.getStats });
  const { data: enquiriesRes } = useAllEnquiries({ limit: 5, page: 1 });

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading stats</div>;

  const stats = statsRes?.data?.data;
  const _raw = enquiriesRes?.data?.data;
  const recentEnquiries = Array.isArray(_raw) ? _raw : Array.isArray(_raw?.data) ? _raw.data : [];

  const statItems = [
    { title: 'Total Users',     value: stats?.totalUsers      || 0, icon: <FaUsers />,      color: 'primary' },
    { title: 'Colleges',        value: stats?.totalColleges   || 0, icon: <FaUniversity />, color: 'success' },
    { title: 'Courses',         value: stats?.totalCourses    || 0, icon: <FaBook />,        color: 'warning' },
    { title: 'Enquiries',       value: stats?.totalEnquiries  || 0, icon: <FaPhone />,       color: 'danger'  },
    { title: 'Pending Reviews', value: stats?.pendingReviews  || 0, icon: <FaStar />,        color: 'warning' },
    // {  title: 'Manage Users',  description: 'View, edit, and manage all user profiles',  icon: '👤', link: '/admin/users',  color: 'bg-purple-50 text-purple-700',}

  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/analytics" className={styles.headerBtn}><FaChartBar /> Analytics</Link>
          <Link to="/admin/leads"     className={styles.headerBtn}><FaInbox /> All Leads</Link>
          <Link to="/admin/about" className={styles.headerBtn}>About Page</Link>
          <Link to="/admin/counselors" className={styles.headerBtn}>Counselors</Link>

        </div>
      </div>

      <div className={styles.statsGrid}>
        {statItems.map((stat, idx) => <StatsCard key={idx} {...stat} />)}
      </div>

      {/* ── ENQUIRY SEGMENT ─────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Enquiries</h2>
          <Link to="/admin/leads" className={styles.seeAll}>See all →</Link>
        </div>
        {recentEnquiries.length === 0 ? (
          <p className={styles.empty}>No enquiries yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Phone</th>
                  <th>College Interest</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map(enq => (
                  <tr key={enq._id}>
                    <td className={styles.tdName}>{enq.studentName}</td>
                    <td>{enq.phone}</td>
                    <td>{enq.collegeInterest?.name || <span className={styles.na}>—</span>}</td>
                    <td>{enq.assignedTo?.name     || <span className={styles.na}>Unassigned</span>}</td>
                    <td>
                      <span className={styles.badge} style={{ background: CONVERSION_COLORS[enq.conversionStatus] || '#64748b' }}>
                        {statusLabel(enq.conversionStatus || 'new')}
                      </span>
                    </td>
                    <td className={styles.tdDate}>
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>
                      <Link to={`/enquiries/${enq._id}`} className={styles.viewLink}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────── */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link to="/admin/colleges"           className={styles.actionCard}>Manage Colleges</Link>
          <Link to="/admin/courses"            className={styles.actionCard}>Manage Courses</Link>
          <Link to="/admin/exams"              className={styles.actionCard}>Manage Exams</Link>
          <Link to="/admin/blogs"              className={styles.actionCard}>Manage Blogs</Link>
          <Link to="/admin/import"             className={styles.actionCard}>Import Data</Link>
          <Link to="/admin/reviews/moderation" className={styles.actionCard}>Moderate Reviews</Link>
          <Link to="/admin/leads"              className={styles.actionCard}>Manage Leads</Link>
          <Link to="/admin/analytics"          className={styles.actionCard}>Analytics</Link>
          <Link to="/admin/role-requests"      className={styles.actionCard}>Role Requests</Link>
          <Link to="/admin/guide" className={styles.actionCard}>Resource Guide</Link>
          <Link to="/admin/video-testimonials" className={styles.actionCard}>Manage Video Testimonials</Link>
          <Link to="/admin/accreditation" className={styles.actionCard}>Accreditation Bodies</Link>
          <Link to="/admin/users" className={styles.actionCard}>Manage Users</Link>
          <Link to="/admin/featured-links" className={styles.actionCard}>Featured Links</Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
