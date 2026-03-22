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
