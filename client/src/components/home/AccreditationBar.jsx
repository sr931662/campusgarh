import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AccreditationBar.module.css';

import ugc   from '../../assets/accreditation/ugc.png';
import aicte from '../../assets/accreditation/aicte.png';
import nba   from '../../assets/accreditation/nba.png';
import naac  from '../../assets/accreditation/naac.png';
import bci   from '../../assets/accreditation/bci.png';
import nmc   from '../../assets/accreditation/nmc.png';
import dci   from '../../assets/accreditation/dci.png';
import pci   from '../../assets/accreditation/pci.png';
import inc   from '../../assets/accreditation/inc.png';
import ncte  from '../../assets/accreditation/ncte.png';
import coa   from '../../assets/accreditation/coa.png';
import icar  from '../../assets/accreditation/icar.png';

const LOGOS = [
  { src: ugc,   alt: 'UGC' },
  { src: aicte, alt: 'AICTE' },
  { src: nba,   alt: 'NBA' },
  { src: naac,  alt: 'NAAC' },
  { src: bci,   alt: 'Bar Council of India' },
  { src: nmc,   alt: 'National Medical Commission' },
  { src: dci,   alt: 'Dental Council of India' },
  { src: pci,   alt: 'Pharmacy Council of India' },
  { src: inc,   alt: 'Indian Nursing Council' },
  { src: ncte,  alt: 'NCTE' },
  { src: coa,   alt: 'Council of Architecture' },
  { src: icar,  alt: 'ICAR' },
];

const CITIES = [
  { label: 'Jaipur',      path: '/colleges?state=Rajasthan&city=Jaipur' },
  { label: 'Delhi NCR',   path: '/colleges?state=Delhi' },
  { label: 'Chandigarh',  path: '/colleges?city=Chandigarh' },
  { label: 'Mumbai',      path: '/colleges?city=Mumbai' },
  { label: 'Indore',      path: '/colleges?city=Indore' },
  { label: 'Bangalore',   path: '/colleges?city=Bangalore' },
  { label: 'Hyderabad',   path: '/colleges?city=Hyderabad' },
  { label: 'Chennai',     path: '/colleges?city=Chennai' },
  { label: 'Pune',        path: '/colleges?city=Pune' },
];

const AccreditationBar = () => {
  // Duplicate logos for seamless infinite scroll
  const track = [...LOGOS, ...LOGOS];

  return (
    <div className={styles.wrapper}>
      {/* Background college image overlay */}
      <div className={styles.bgOverlay} />

      <div className={styles.inner}>
        {/* Label */}
        <p className={styles.label}>Recognized & Approved By</p>

        {/* Scrolling logos */}
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {track.map((logo, i) => (
              <div key={i} className={styles.logoItem}>
                <img src={logo.src} alt={logo.alt} className={styles.logo} />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Cities */}
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
};

export default AccreditationBar;
