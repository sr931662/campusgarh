import React from 'react';
import styles from './ActivityFeed.module.css';
import { formatRelativeTime } from '../../utils/formatters';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return <div className={styles.empty}>No recent activity</div>;
  }
  return (
    <div className={styles.feed}>
      {activities.map((activity, idx) => (
        <div key={idx} className={styles.item}>
          <div className={styles.icon}>{activity.icon}</div>
          <div className={styles.content}>
            <p>{activity.message}</p>
            <span>{formatRelativeTime(activity.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;