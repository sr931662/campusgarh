import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaLaptop } from 'react-icons/fa';
import { useOnlineColleges } from '../../hooks/queries';
import styles from './TopOnlineUniversities.module.css';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const OnlineCard = ({ college }) => (
  <Link to={`/colleges/${college.slug}`} className={styles.card}>
    <div className={styles.cardTop}>
      {college.logoUrl
        ? <img src={college.logoUrl} alt={college.name} className={styles.logo} onError={e => e.target.style.display = 'none'} />
        : <div className={styles.initials}>{(college.shortName || college.name).split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>}
      <span className={styles.onlineBadge}><FaLaptop size={10} /> Online</span>
    </div>
    <div className={styles.cardBody}>
      <span className={styles.tag}>{college.collegeType || 'University'}</span>
      <h3 className={styles.name}>{college.shortName || college.name}</h3>
      {(college.contact?.city || college.contact?.state) && (
        <p className={styles.loc}><FaMapMarkerAlt /> {[college.contact.city, college.contact.state].filter(Boolean).join(', ')}</p>
      )}
      {college.accreditation?.naacGrade && <span className={styles.naac}>NAAC {college.accreditation.naacGrade}</span>}
    </div>
  </Link>
);

const TopOnlineUniversities = () => {
  const { data, isLoading, error } = useOnlineColleges({ limit: 8 });
  const raw = data?.data?.data;
  const colleges = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  if (!isLoading && !error && colleges.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div>
            <p className={styles.eyebrow}>Learn From Anywhere</p>
            <h2 className={styles.heading}>Top Online <span>Universities</span></h2>
            <p className={styles.sub}>Accredited online degrees from India's leading universities.</p>
          </div>
          <Link to="/colleges?mode=online" className={styles.viewAll}>View All →</Link>
        </motion.div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <motion.div className={styles.grid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            {colleges.map(c => (
              <motion.div key={c._id} variants={fadeUp} style={{ height: '100%' }}>
                <OnlineCard college={c} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TopOnlineUniversities;
