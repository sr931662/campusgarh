import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './PredictorWidget.module.css';

const OPTIONS = [
  { key: 'college', icon: '🏛️', title: 'College Predictor', desc: 'Find colleges that match your percentile, rank & budget' },
  { key: 'course',  icon: '📚', title: 'Course Predictor',  desc: 'Discover courses suited to your academic profile' },
  { key: 'exam',    icon: '✏️', title: 'Exam Predictor',    desc: 'Know which entrance exams to target for your goals' },
];

const PredictorWidget = () => {
  const [active, setActive] = useState('college');
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>AI-Powered Guidance</p>
        <h2 className={styles.title}>Find Your Perfect Fit</h2>
        <p className={styles.subtitle}>
          Enter your score, percentage, or target discipline — get personalised predictions instantly.
        </p>

        <div className={styles.cards}>
          {OPTIONS.map(o => (
            <div
              key={o.key}
              className={`${styles.card} ${active === o.key ? styles.cardActive : ''}`}
              onClick={() => setActive(o.key)}
            >
              <div className={styles.cardIcon}>{o.icon}</div>
              <p className={styles.cardTitle}>{o.title}</p>
              <p className={styles.cardDesc}>{o.desc}</p>
            </div>
          ))}
        </div>

        <Link to={`/predictor?type=${active}`} className={styles.cta}>
          ⚡ Start Predicting — It's Free
        </Link>
        <p className={styles.ctaNote}>Login required · Results based on real NIRF & placement data</p>
      </div>
    </section>
  );
};

export default PredictorWidget;
