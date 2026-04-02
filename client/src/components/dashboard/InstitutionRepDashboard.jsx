import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { FaUniversity, FaClipboardList, FaGraduationCap, FaChartBar, FaPhone } from 'react-icons/fa';
import styles from './InstitutionRepDashboard.module.css';

const InstitutionRepDashboard = () => {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Institution Dashboard</h1>
        <p>Welcome, {user?.name || 'Representative'}</p>
      </div>
      {/* ─── Institution Rep Notice Banner ─── */}
      <div style={{
        maxWidth: '820px',
        margin: '0 auto 2rem',
        padding: '1.1rem 1.5rem',
        background: '#f5f3ff',
        border: '1.5px solid #ddd6fe',
        borderLeft: '4px solid #8b5cf6',
        borderRadius: '14px',
      }}>
        <p style={{
          margin: '0 0 0.85rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#6d28d9',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Your Institution Profile — Features Available to You
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.55rem',
        }}>
          {[
            { icon: '🏫', label: 'College Profile Control',  desc: "Update your institution's description, images, and key info." },
            { icon: '📚', label: 'Course & Fee Management',  desc: 'Add or edit courses offered, annual fees, and seat intake.' },
            { icon: '📈', label: 'Placement & Stats View',   desc: 'Showcase year-wise placements and admission trend data.' },
            { icon: '💬', label: 'Student Enquiry Inbox',    desc: 'Receive and respond to enquiries directed at your institution.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              padding: '0.6rem 0.75rem',
              background: '#fff',
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.77rem', color: '#3b0764', fontWeight: 700, lineHeight: '1.3' }}>
                  {item.label}
                </strong>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#4b5563', lineHeight: '1.45', marginTop: '0.1rem' }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: '0.8rem 0 0', fontSize: '0.73rem', color: '#7c3aed', fontWeight: 600 }}>
          ✨ Portal features are being activated — you'll be notified as each section goes live.
        </p>
      </div>

      <div className={styles.comingSoon}>
        <span className={styles.comingSoonIcon}><FaUniversity /></span>
        <h2>Institution Portal — Coming Soon</h2>
        <p>
          Your dedicated dashboard for managing your institution's profile, courses,
          admissions data, and student enquiries is under development.
        </p>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span><FaClipboardList /></span>
            <span>Manage your college profile & media</span>
          </div>
          <div className={styles.featureItem}>
            <span><FaGraduationCap /></span>
            <span>Update courses, fees & seat intake</span>
          </div>
          <div className={styles.featureItem}>
            <span><FaChartBar /></span>
            <span>View placement & admission stats</span>
          </div>
          <div className={styles.featureItem}>
            <span><FaPhone /></span>
            <span>Receive and manage student enquiries</span>
          </div>
        </div>
        <Link to="/colleges" className={styles.exploreBtn}>
          Browse Colleges →
        </Link>
      </div>
    </div>
  );
};

export default InstitutionRepDashboard;
