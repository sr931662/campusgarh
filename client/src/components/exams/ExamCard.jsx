import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ExamCard.module.css';
import { formatDate } from '../../utils/formatters';
import { FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign } from 'react-icons/fa';

const ExamCard = ({ exam }) => {
  const upcomingDate = exam.importantDates?.find(d => d.event === 'Exam Date');
  const registrationOpen = exam.importantDates?.find(d => d.event === 'Registration End')?.date > new Date();

  return (
    <Link to={`/exams/${exam.slug}`} className={styles.link}>
      <div className={`card ${styles.card}`}>
        <div className={styles.header}>
          <h3 className={styles.name}>{exam.name}</h3>
          <span className={styles.categoryBadge}>{exam.category || 'Exam'}</span>
        </div>
        <div className={styles.meta}>
          {exam.conductingBody && <span className={styles.conductingBody}>{exam.conductingBody}</span>}
          {exam.examLevel && <span className={styles.levelBadge}>{exam.examLevel}</span>}
          {exam.examMode && <span className={styles.modeBadge}>{exam.examMode}</span>}
        </div>
        {upcomingDate && (
          <div className={styles.dateRow}>
            <FaCalendarAlt className={styles.icon} />
            <span>Exam Date: {formatDate(upcomingDate.date)}</span>
          </div>
        )}
        {registrationOpen && (
          <div className={styles.regOpen}>Registration Open</div>
        )}
        {exam.participatingColleges?.length > 0 && (
          <div className={styles.colleges}>
            {exam.participatingColleges.length}+ colleges accept this exam
          </div>
        )}
        {exam.registrationFee && (
          <div className={styles.fee}>
            <FaRupeeSign /> {exam.registrationFee} Application Fee
          </div>
        )}
      </div>
    </Link>
  );
};

export default ExamCard;