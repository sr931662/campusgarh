import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card/Card';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
  const { name, slug, category, discipline, duration, mode, description, feeRange, jobRoles, careerProspects } = course;

  return (
    <Link to={`/courses/${slug}`} className={styles.link}>
      <Card hover className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.name}>{name}</h3>
          <div className={styles.categoryBadge}>{category}</div>
        </div>

        {discipline && <div className={styles.discipline}>{discipline}</div>}

        <div className={styles.details}>
          <span className={styles.detail}>⏱️ {duration}</span>
          {mode && <span className={styles.detail}>📚 {mode}</span>}
          {(feeRange?.min || feeRange?.max) && (
            <span className={styles.detail}>
              💰 {feeRange.min ? `₹${(feeRange.min / 100000).toFixed(1)}L` : ''}
              {feeRange.min && feeRange.max ? '–' : ''}
              {feeRange.max ? `₹${(feeRange.max / 100000).toFixed(1)}L` : ''}
            </span>
          )}
          {careerProspects?.averageStartingSalary && (
            <span className={styles.detail}>💼 Avg ₹{(careerProspects.averageStartingSalary / 100000).toFixed(1)}L/yr</span>
          )}
        </div>

        <p className={styles.description}>
          {description?.substring(0, 100)}{description?.length > 100 ? '...' : ''}
        </p>

        {jobRoles?.length > 0 && (
          <div className={styles.jobRoles}>
            {jobRoles.slice(0, 3).map((role, idx) => (
              <span key={idx} className={styles.jobTag}>{role}</span>
            ))}
            {jobRoles.length > 3 && <span className={styles.moreTags}>+{jobRoles.length - 3} more</span>}
          </div>
        )}
      </Card>
    </Link>
  );
};

export default CourseCard;