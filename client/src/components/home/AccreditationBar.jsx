import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { accreditationService } from '../../services/accreditationService';
import styles from './AccreditationBar.module.css';

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

const AccreditationBar = () => {
  const { data } = useQuery({
    queryKey: ['accreditation-public'],
    queryFn: () => accreditationService.getAll(),
    staleTime: 1000 * 60 * 10,
  });
  const bodies = data?.data?.data || [];
  const track = bodies.length > 0 ? [...bodies, ...bodies] : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <p className={styles.label}>Recognized & Approved By</p>

        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack} style={track.length === 0 ? { animation: 'none' } : {}}>
            {track.length === 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Loading...</span>
            ) : track.map((b, i) => (
              <div key={i} className={styles.logoItem} title={b.full}>
                {b.logoUrl
                  ? <img src={b.logoUrl} alt={b.abbr} className={styles.logo} />
                  : <div className={styles.badge}>{b.abbr}</div>}
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
};

export default AccreditationBar;
