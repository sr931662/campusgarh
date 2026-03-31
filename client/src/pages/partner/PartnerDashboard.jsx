import { Link } from 'react-router-dom';
import { FaUpload, FaListAlt, FaCheckCircle, FaSpinner, FaUsers } from 'react-icons/fa';
import { usePartnerAnalytics } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './PartnerDashboard.module.css';

const statusLabel = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const STATUS_COLORS = {
  new: '#64748b', contacted: '#3b82f6', interested: '#10b981',
  not_interested: '#ef4444', converted: '#22c55e', lost: '#94a3b8',
};

export default function PartnerDashboard() {
  const { data: res, isLoading } = usePartnerAnalytics();
  const d = res?.data?.data ?? {};
  const { total = 0, converted = 0, statusBreakdown = [] } = d;
  const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Partner Dashboard</h1>
          <p className={styles.subtitle}>Track the leads you've submitted and their progress</p>
        </div>
        <Link to="/partner/import" className={styles.importBtn}>
          <FaUpload /> Import Leads
        </Link>
      </div>

      {isLoading ? <Loader /> : (
        <>
          {/* Summary cards */}
          <div className={styles.cards}>
            <div className={styles.card}>
              <FaUsers className={styles.cardIcon} style={{ color: 'var(--gold)' }} />
              <span className={styles.cardValue}>{total}</span>
              <span className={styles.cardLabel}>Total Leads Submitted</span>
            </div>
            <div className={styles.card}>
              <FaCheckCircle className={styles.cardIcon} style={{ color: '#22c55e' }} />
              <span className={styles.cardValue}>{converted}</span>
              <span className={styles.cardLabel}>Converted</span>
            </div>
            <div className={styles.card}>
              <FaSpinner className={styles.cardIcon} style={{ color: '#3b82f6' }} />
              <span className={styles.cardValue}>{total - converted}</span>
              <span className={styles.cardLabel}>In Pipeline</span>
            </div>
            <div className={styles.card}>
              <FaListAlt className={styles.cardIcon} style={{ color: '#8b5cf6' }} />
              <span className={styles.cardValue}>{rate}%</span>
              <span className={styles.cardLabel}>Conversion Rate</span>
            </div>
          </div>

          {/* Status breakdown */}
          {statusBreakdown.length > 0 && (
            <div className={styles.breakdown}>
              <h2 className={styles.sectionTitle}>Lead Status Breakdown</h2>
              <div className={styles.barList}>
                {statusBreakdown.map(item => {
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item._id} className={styles.barRow}>
                      <span className={styles.barLabel}>{statusLabel(item._id || 'unknown')}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${pct}%`, background: STATUS_COLORS[item._id] || '#94a3b8' }}
                        />
                      </div>
                      <span className={styles.barMeta}>{item.count} · {pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Link to="/partner/leads" className={styles.actionBtn}>View All My Leads →</Link>
          </div>
        </>
      )}
    </div>
  );
}
