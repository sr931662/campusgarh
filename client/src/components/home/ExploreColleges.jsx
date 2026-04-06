import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFeaturedColleges } from '../../hooks/queries';
import styles from './ExploreColleges.module.css';

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const CollegeLogoCard = ({ college }) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(college.shortName || college.name);

  return (
    <motion.div variants={fadeUp}>
      <Link to={`/colleges/${college.slug}`} className={styles.card}>
        <div className={styles.logoWrap}>
          {college.logoUrl && !imgError ? (
            <img
              src={college.logoUrl}
              alt={college.name}
              className={styles.logo}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={styles.initials}>{initials}</div>
          )}
        </div>
        <div className={styles.cardBody}>
          <span className={styles.type}>{college.collegeType || college.fundingType || 'University'}</span>
          <p className={styles.name}>{college.shortName || college.name}</p>
          {college.contact?.city && (
            <p className={styles.city}>{college.contact.city}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

const ExploreColleges = () => {
  const { data, isLoading, error } = useFeaturedColleges({ limit: 12 });

  const raw = data?.data?.data;
  const colleges = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  if (!isLoading && !error && colleges.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial="hidden" whileInView="visible"
          viewport={{ once: true }} variants={fadeUp}
        >
          <p className={styles.eyebrow}>Discover</p>
          <h2 className={styles.heading}>
            Explore Top Colleges &amp; <span>Compare on 30+ Factors</span>
          </h2>
          <p className={styles.sub}>
            Browse India's leading institutions — filter by stream, city, fees, and more.
          </p>
        </motion.div>

        {isLoading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <motion.div
            className={styles.grid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.05 }} variants={stagger}
          >
            {colleges.map(college => (
              <CollegeLogoCard key={college._id} college={college} />
            ))}
          </motion.div>
        )}

        <motion.div
          className={styles.footer}
          initial="hidden" whileInView="visible"
          viewport={{ once: true }} variants={fadeUp}
        >
          <Link to="/colleges" className={styles.viewMoreBtn}>
            View More Colleges →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreColleges;
