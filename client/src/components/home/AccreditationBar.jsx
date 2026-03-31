import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AccreditationBar.module.css';

const LOGOS = [
  { abbr: 'UGC',  full: 'University Grants Commission' },
  { abbr: 'AICTE',full: 'All India Council for Technical Education' },
  { abbr: 'NBA',  full: 'National Board of Accreditation' },
  { abbr: 'NAAC', full: 'National Assessment & Accreditation Council' },
  { abbr: 'BCI',  full: 'Bar Council of India' },
  { abbr: 'NMC',  full: 'National Medical Commission' },
  { abbr: 'DCI',  full: 'Dental Council of India' },
  { abbr: 'PCI',  full: 'Pharmacy Council of India' },
  { abbr: 'INC',  full: 'Indian Nursing Council' },
  { abbr: 'NCTE', full: 'National Council for Teacher Education' },
  { abbr: 'COA',  full: 'Council of Architecture' },
  { abbr: 'ICAR', full: 'Indian Council of Agricultural Research' },
];

const CITIES = [
  { label: 'Jaipur',     path: '/colleges?city=Jaipur' },
  { label: 'Delhi NCR',  path: '/colleges?state=Delhi' },
  { label: 'Chandigarh', path: '/colleges?city=Chandigarh' },
  { label: 'Mumbai',     path: '/colleges?city=Mumbai' },
  { label: 'Indore',     path: '/colleges?city=Indore' },
  { label: 'Bangalore',  path: '/colleges?city=Bangalore' },
  { label: 'Hyderabad',  path: '/colleges?city=Hyderabad' },
  { label: 'Chennai',    path: '/colleges?city=Chennai' },
  { label: 'Pune',       path: '/colleges?city=Pune' },
];

const track = [...LOGOS, ...LOGOS];

const AccreditationBar = () => (
  <div className={styles.wrapper}>
    <div className={styles.inner}>
      <p className={styles.label}>Recognized & Approved By</p>

      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {track.map((logo, i) => (
            <div key={i} className={styles.badge} title={logo.full}>
              {logo.abbr}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.cities}>
        {CITIES.map((city) => (
          <Link key={city.label} to={city.path} className={styles.city}>
            <span className={styles.dot} />
            {city.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default AccreditationBar;
