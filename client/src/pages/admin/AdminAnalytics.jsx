import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaUniversity, FaBook, FaPhone,
  FaCheckCircle, FaBell, FaArrowLeft,
} from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminAnalytics.module.css';

const statusLabel = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const CONVERSION_COLORS = {
  new: '#64748b', contacted: '#3b82f6', interested: '#10b981',
  not_interested: '#ef4444', converted: '#22c55e', lost: '#94a3b8',
};
const CALL_COLORS = {
  pending: '#f59e0b', connected: '#10b981', not_reachable: '#ef4444', follow_up: '#8b5cf6',
};
const SOURCE_COLORS = {
  website: '#C9A84C', referral: '#3b82f6', social: '#ec4899', ads: '#f97316', other: '#94a3b8',
};

function BarRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={styles.barRow}>
      <div className={styles.barLabel}>
        <span className={styles.barName}>{statusLabel(label || 'unknown')}</span>
        <span className={styles.barCount}>{count}</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%`, background: color || 'var(--gold)' }} />
      </div>
      <span className={styles.barPct}>{pct}%</span>
    </div>
  );
}

export default function AdminAnalytics() {
  const { data: res, isLoading, error } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminService.getAnalytics,
    staleTime: 60 * 1000,
  });

  if (isLoading) return <Loader />;
  if (error) return <div className={styles.error}>Failed to load analytics.</div>;

  const d = res?.data?.data || {};
  const { conversionBreakdown = [], callStatusBreakdown = [], sourceBreakdown = [], totals = {}, todayFollowUps = 0, thisMonthEnquiries = 0 } = d;

  const totalEnq = totals.totalEnquiries || 0;
  const conversionRate = totalEnq > 0 ? ((totals.convertedCount / totalEnq) * 100).toFixed(1) : '0.0';

  const platformCards = [
    { label: 'Total Users',      value: totals.totalUsers     || 0, icon: <FaUsers />,      color: 'var(--gold)' },
    { label: 'Colleges',         value: totals.totalColleges  || 0, icon: <FaUniversity />, color: '#10b981' },
    { label: 'Courses',          value: totals.totalCourses   || 0, icon: <FaBook />,        color: '#3b82f6' },
    { label: 'Total Enquiries',  value: totalEnq,                    icon: <FaPhone />,       color: '#f59e0b' },
    { label: 'Converted',        value: totals.convertedCount || 0, icon: <FaCheckCircle />, color: '#22c55e' },
    { label: "Today's Follow-ups", value: todayFollowUps,             icon: <FaBell />,        color: '#8b5cf6' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <Link to="/dashboard/admin" className={styles.backLink}><FaArrowLeft /> Dashboard</Link>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Platform performance overview</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.conversionRate}>
            <span className={styles.rateValue}>{conversionRate}%</span>
            <span className={styles.rateLabel}>Conversion Rate</span>
          </div>
          <div className={styles.monthStat}>
            <span className={styles.monthValue}>{thisMonthEnquiries}</span>
            <span className={styles.monthLabel}>This Month</span>
          </div>
        </div>
      </div>

      {/* Platform Totals */}
      <div className={styles.platformGrid}>
        {platformCards.map((c, i) => (
          <div key={i} className={styles.platformCard}>
            <span className={styles.platformIcon} style={{ color: c.color }}>{c.icon}</span>
            <span className={styles.platformValue}>{c.value.toLocaleString('en-IN')}</span>
            <span className={styles.platformLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className={styles.chartsGrid}>
        {/* Conversion Funnel */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Conversion Funnel</h2>
          <p className={styles.chartSubtitle}>Lead stages by count</p>
          <div className={styles.bars}>
            {['new','contacted','interested','converted','not_interested','lost'].map(status => {
              const item = conversionBreakdown.find(b => b._id === status);
              return (
                <BarRow
                  key={status}
                  label={status}
                  count={item?.count || 0}
                  total={totalEnq}
                  color={CONVERSION_COLORS[status]}
                />
              );
            })}
          </div>
        </div>

        {/* Call Status */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Call Status</h2>
          <p className={styles.chartSubtitle}>Current call states</p>
          <div className={styles.bars}>
            {callStatusBreakdown.map(item => (
              <BarRow
                key={item._id}
                label={item._id}
                count={item.count}
                total={totalEnq}
                color={CALL_COLORS[item._id] || '#94a3b8'}
              />
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Lead Sources</h2>
          <p className={styles.chartSubtitle}>Where leads come from</p>
          <div className={styles.bars}>
            {sourceBreakdown.map(item => (
              <BarRow
                key={item._id}
                label={item._id}
                count={item.count}
                total={totalEnq}
                color={SOURCE_COLORS[item._id] || '#94a3b8'}
              />
            ))}
            {sourceBreakdown.length === 0 && (
              <p className={styles.empty}>No source data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick link */}
      <div className={styles.footer}>
        <Link to="/admin/leads" className={styles.leadsBtn}>Manage All Leads →</Link>
      </div>
    </div>
  );
}
