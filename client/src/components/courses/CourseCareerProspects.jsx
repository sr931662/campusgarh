import React from 'react';
import { FaRupeeSign, FaChartLine, FaBriefcase } from 'react-icons/fa';
import styles from './CourseCareerProspects.module.css';
import { formatCurrency } from '../../utils/formatters';

const CourseCareerProspects = ({ course }) => {
  const { careerProspects, jobRoles, skills } = course;

  const hasData = careerProspects || jobRoles?.length || skills?.length;

  if (!hasData) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>Career Prospects</h2>
        <p className={styles.emptyMsg}>Career information not available for this course.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Career Prospects</h2>

      {careerProspects && (
        <>
          <div className={styles.statsRow}>
            {careerProspects.averageStartingSalary && (
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaRupeeSign /></div>
                <div className={styles.statLabel}>Avg Starting Salary</div>
                <div className={styles.statValue}>{formatCurrency(careerProspects.averageStartingSalary)} / year</div>
              </div>
            )}
            {careerProspects.growthRate && (
              <div className={styles.statCard}>
                <div className={styles.statIcon}><FaChartLine /></div>
                <div className={styles.statLabel}>Industry Growth</div>
                <div className={styles.statValue}>{careerProspects.growthRate}</div>
              </div>
            )}
          </div>

          {careerProspects.description && (
            <div className={styles.descBox}>
              <p>{careerProspects.description}</p>
            </div>
          )}

          {careerProspects.topSectors?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.subTitle}>Top Sectors</h3>
              <div className={styles.sectorList}>
                {careerProspects.topSectors.map((sector, idx) => (
                  <div key={idx} className={styles.sectorItem}>
                    <span className={styles.sectorName}>{sector}</span>
                    <div className={styles.sectorBar}>
                      <div className={styles.sectorFill} style={{ width: `${Math.max(30, 100 - idx * 12)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {jobRoles?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Common Job Roles</h3>
          <div className={styles.tagGrid}>
            {jobRoles.map((role, idx) => (
              <span key={idx} className={styles.jobTag}><FaBriefcase /> {role}</span>
            ))}
          </div>
        </div>
      )}

      {skills?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Key Skills You'll Learn</h3>
          <div className={styles.tagGrid}>
            {skills.map((skill, idx) => (
              <span key={idx} className={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCareerProspects;
