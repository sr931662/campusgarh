import React from 'react';
import { FaPhone, FaClock } from 'react-icons/fa';
import { useMyEnquiries } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import styles from './CounsellorDashboard.module.css';
import { Link } from 'react-router-dom';

const CounsellorDashboard = () => {
  const { data: enquiriesData, isLoading } = useMyEnquiries({ limit: 5 });
  if (isLoading) return <Loader />;

  const _raw = enquiriesData?.data?.data;
  const enquiries = Array.isArray(_raw) ? _raw : Array.isArray(_raw?.data) ? _raw.data : [];

  const stats = [
    { title: 'Active Leads',   value: enquiries.length, icon: <FaPhone />, color: 'primary' },
    { title: 'Follow-up Today', value: enquiries.filter(e => e.followUpDate && new Date(e.followUpDate).toDateString() === new Date().toDateString()).length, icon: <FaClock />, color: 'warning' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Counsellor Dashboard</h1>
        <p>Manage your assigned leads</p>
      </div>
      {/* ─── Counsellor Notice Banner ─── */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.1rem 1.5rem',
        background: '#eff6ff',
        border: '1.5px solid #bfdbfe',
        borderLeft: '4px solid #3b82f6',
        borderRadius: '14px',
      }}>
        <p style={{
          margin: '0 0 0.85rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#1d4ed8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Your Counsellor Profile — What You Can Do
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.55rem',
        }}>
          {[
            { icon: '📋', label: 'Lead Management',      desc: 'View and act on every student enquiry assigned to you.' },
            { icon: '📞', label: 'Follow-up Scheduler',  desc: 'Set dates and track all your student conversations.' },
            { icon: '🗂️', label: 'Pipeline Status',      desc: 'Move leads through Contacted → Interested → Converted.' },
            { icon: '🎓', label: 'Full Platform Access', desc: 'All college, course, and exam data to guide students better.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              padding: '0.6rem 0.75rem',
              background: '#fff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.77rem', color: '#1e3a5f', fontWeight: 700, lineHeight: '1.3' }}>
                  {item.label}
                </strong>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#4b5563', lineHeight: '1.45', marginTop: '0.1rem' }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <StatsCard key={idx} {...stat} />
        ))}
      </div>
      <div className={styles.section}>
        <h2>Recent Leads</h2>
        {enquiries.length === 0 ? (
          <div className={styles.empty}>No leads assigned yet.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course Interest</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq._id}>
                    <td>{enq.studentName}</td>
                    <td>{enq.courseInterest?.name || 'N/A'}</td>
                    <td>{enq.conversionStatus}</td>
                    <td>{enq.followUpDate ? new Date(enq.followUpDate).toLocaleDateString() : 'N/A'}</td>
                    <td><Link to={`/enquiries/${enq._id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounsellorDashboard;