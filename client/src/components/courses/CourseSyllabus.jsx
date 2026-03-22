import React, { useState } from 'react';
import styles from './CourseSyllabus.module.css';

const CourseSyllabus = ({ syllabus = [] }) => {
  const [openSem, setOpenSem] = useState(syllabus[0]?.semester || null);
  const [openUnit, setOpenUnit] = useState(null);

  if (syllabus.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>Syllabus</h2>
        <p className={styles.emptyMsg}>Detailed syllabus not available. Contact the college or visit the official website.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Semester-wise Syllabus</h2>
      <div className={styles.semList}>
        {syllabus.map((sem) => {
          const isOpen = openSem === sem.semester;
          return (
            <div key={sem.semester} className={styles.semBlock}>
              <button
                className={`${styles.semHeader} ${isOpen ? styles.semHeaderOpen : ''}`}
                onClick={() => setOpenSem(isOpen ? null : sem.semester)}
              >
                <span className={styles.semLabel}>Semester {sem.semester}</span>
                <span className={styles.semUnits}>{sem.units?.length || 0} units</span>
                <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className={styles.semContent}>
                  {sem.units?.map((unit) => {
                    const unitKey = `${sem.semester}-${unit.unitNumber}`;
                    const unitOpen = openUnit === unitKey;
                    return (
                      <div key={unitKey} className={styles.unitBlock}>
                        <button
                          className={`${styles.unitHeader} ${unitOpen ? styles.unitHeaderOpen : ''}`}
                          onClick={() => setOpenUnit(unitOpen ? null : unitKey)}
                        >
                          <span>Unit {unit.unitNumber}: {unit.title}</span>
                          <span className={styles.chevronSm}>{unitOpen ? '▲' : '▼'}</span>
                        </button>
                        {unitOpen && unit.topics?.length > 0 && (
                          <ul className={styles.topicList}>
                            {unit.topics.map((topic, i) => (
                              <li key={i}>{topic}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSyllabus;
