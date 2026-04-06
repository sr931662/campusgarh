import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useFeaturedColleges, useColleges } from '../../hooks/queries';
import styles from './TopInstitutions.module.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

const CollegeCard = ({ college }) => (
  <Link to={`/colleges/${college.slug}`} className={styles.card}>
    <div className={styles.cardTop}>
      {college.logoUrl
        ? <img src={college.logoUrl} alt={college.name} className={styles.logo} onError={e => e.target.style.display='none'} />
        : <div className={styles.initials}>{(college.shortName || college.name).split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>}
    </div>
    <div className={styles.cardBody}>
      <span className={styles.tag}>{college.fundingType || college.collegeType || 'Institution'}</span>
      <h3 className={styles.name}>{college.shortName || college.name}</h3>
      {(college.contact?.city || college.contact?.state) && (
        <p className={styles.loc}><FaMapMarkerAlt /> {[college.contact.city, college.contact.state].filter(Boolean).join(', ')}</p>
      )}
      {college.accreditation?.naacGrade && <span className={styles.naac}>NAAC {college.accreditation.naacGrade}</span>}
    </div>
  </Link>
);

const TopInstitutions = () => {
  const [tab, setTab] = useState('overall');
  const [state, setState] = useState('Maharashtra');

  const { data: featData, isLoading: featLoading } = useFeaturedColleges({ limit: 8 });
  const featRaw = featData?.data?.data;
  const featured = Array.isArray(featRaw) ? featRaw : Array.isArray(featRaw?.data) ? featRaw.data : [];

  const { data: stateData, isLoading: stateLoading } = useColleges(
    { limit: 8, state },
    { enabled: tab === 'state' },
  );
  const stateRaw = stateData?.data?.data;
  const byState = Array.isArray(stateRaw) ? stateRaw : Array.isArray(stateRaw?.data) ? stateRaw.data : [];

  const colleges = tab === 'overall' ? featured : byState;
  const loading = tab === 'overall' ? featLoading : stateLoading;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div>
            <p className={styles.eyebrow}>Admin Curated</p>
            <h2 className={styles.heading}>Top <span>Institutions</span></h2>
          </div>
          <Link to="/colleges" className={styles.viewAll}>View All →</Link>
        </motion.div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button className={tab === 'overall' ? styles.tabActive : styles.tab} onClick={() => setTab('overall')}>Overall Top</button>
            <button className={tab === 'state' ? styles.tabActive : styles.tab} onClick={() => setTab('state')}>By State</button>
          </div>
          {tab === 'state' && (
            <select className={styles.stateSelect} value={state} onChange={e => setState(e.target.value)}>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : colleges.length === 0 ? (
          <p className={styles.empty}>No institutions found{tab === 'state' ? ` in ${state}` : ''}.</p>
        ) : (
          <motion.div className={styles.grid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} variants={stagger}>
            {colleges.map(c => <motion.div key={c._id} variants={fadeUp}><CollegeCard college={c} /></motion.div>)}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TopInstitutions;
