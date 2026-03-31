import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourses } from '../../hooks/queries';
import styles from './TopCourses.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const TopCourses = () => {
  const { data, isLoading } = useCourses({ limit: 8, sort: '-createdAt' });
  const raw = data?.data?.data;
  const courses = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  if (!isLoading && courses.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div>
            <p className={styles.eyebrow}>Admin Curated</p>
            <h2 className={styles.heading}>Top <span>Courses</span></h2>
            <p className={styles.sub}>Hand-picked programmes across disciplines, updated by our team.</p>
          </div>
          <Link to="/courses" className={styles.viewAll}>View All →</Link>
        </motion.div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <motion.div className={styles.grid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            {courses.map(course => (
              <motion.div key={course._id} variants={fadeUp}>
                <Link to={`/courses/${course.slug}`} className={styles.card}>
                  <span className={styles.level}>{course.category || 'UG'}</span>
                  <h3 className={styles.name}>{course.name}</h3>
                  <p className={styles.discipline}>{course.discipline || '—'}</p>
                  <div className={styles.meta}>
                    {course.duration && <span>{course.duration}</span>}
                    {course.mode && <span>{course.mode}</span>}
                  </div>
                  <span className={styles.arrow}>Explore →</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TopCourses;
