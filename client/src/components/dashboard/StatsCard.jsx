import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, trend, color = 'primary' }) => {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <span className={styles.icon}>{icon}</span>
      <p className={styles.label}>{title}</p>
      <p className={styles.value}>{value}</p>
      {trend && <span className={styles.trend}>{trend}</span>}
    </div>
  );
};

export default StatsCard;
