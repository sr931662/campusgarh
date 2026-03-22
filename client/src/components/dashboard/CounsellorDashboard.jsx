import React from 'react';
import { useMyEnquiries } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import StatsCard from './StatsCard';
import styles from './CounsellorDashboard.module.css';
import { Link } from 'react-router-dom';

const CounsellorDashboard = () => {
  const { data: enquiriesData, isLoading } = useMyEnquiries({ limit: 5 });
  if (isLoading) return <Loader />;

  const enquiries = enquiriesData?.data?.data || [];
  const stats = [
    { title: 'Active Leads', value: enquiries.length, icon: '📞', color: 'primary' },
    { title: 'Follow-up Today', value: enquiries.filter(e => e.followUpDate && new Date(e.followUpDate).toDateString() === new Date().toDateString()).length, icon: '⏰', color: 'warning' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Counsellor Dashboard</h1>
        <p>Manage your assigned leads</p>
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