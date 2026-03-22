import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaHourglassHalf, FaFlag, FaStar, FaCheckCircle } from 'react-icons/fa';
import { reviewService } from '../../services/reviewService';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import styles from './ModeratorDashboard.module.css';

const ModeratorDashboard = () => {
  const { data: pendingRes, isLoading: pendingLoading } = useQuery({
    queryKey: ['reviews', 'pending', 'count'],
    queryFn: () => reviewService.getAllReviews({ status: 'pending', limit: 1 }),
  });
  const { data: flaggedRes, isLoading: flaggedLoading } = useQuery({
    queryKey: ['reviews', 'flagged', 'count'],
    queryFn: () => reviewService.getAllReviews({ status: 'flagged', limit: 1 }),
  });

  const pendingCount = pendingRes?.data?.data?.pagination?.total ?? 0;
  const flaggedCount = flaggedRes?.data?.data?.pagination?.total ?? 0;

  const isLoading = pendingLoading || flaggedLoading;
  if (isLoading) return <Loader />;

  const stats = [
    { title: 'Pending Reviews', value: pendingCount, icon: <FaHourglassHalf />, color: 'warning' },
    { title: 'Flagged Reviews', value: flaggedCount, icon: <FaFlag />,          color: 'danger'  },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Moderator Dashboard</h1>
        <p>Review moderation queue and content oversight</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>

      <div className={styles.actionsSection}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link to="/admin/reviews/moderation" className={styles.actionCard}>
            <span className={styles.actionIcon}><FaStar /></span>
            <span className={styles.actionLabel}>Review Queue</span>
            <span className={styles.actionDesc}>Approve, reject, or flag student reviews</span>
            {pendingCount > 0 && (
              <span className={styles.actionBadge}>{pendingCount} pending</span>
            )}
          </Link>
          <Link to="/admin/reviews/moderation?status=flagged" className={styles.actionCard}>
            <span className={styles.actionIcon}><FaFlag /></span>
            <span className={styles.actionLabel}>Flagged Content</span>
            <span className={styles.actionDesc}>Review content reported by users</span>
            {flaggedCount > 0 && (
              <span className={styles.actionBadge}>{flaggedCount} flagged</span>
            )}
          </Link>
          <Link to="/admin/reviews/moderation?status=approved" className={styles.actionCard}>
            <span className={styles.actionIcon}><FaCheckCircle /></span>
            <span className={styles.actionLabel}>Approved Reviews</span>
            <span className={styles.actionDesc}>Browse all live published reviews</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
