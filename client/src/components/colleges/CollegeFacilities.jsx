import {
  FaBook, FaFlask, FaFutbol, FaHome, FaUtensils, FaMicrophoneAlt,
  FaDumbbell, FaHospital, FaWifi, FaBus, FaSwimmingPool,
  FaTableTennis, FaStethoscope, FaLaptop, FaUniversity,
} from 'react-icons/fa';
import styles from './CollegeFacilities.module.css';

const FACILITY_ICONS = {
  library: <FaBook />, lab: <FaFlask />, sports: <FaFutbol />,
  hostel: <FaHome />, cafeteria: <FaUtensils />, auditorium: <FaMicrophoneAlt />,
  gym: <FaDumbbell />, hospital: <FaHospital />, wifi: <FaWifi />,
  transport: <FaBus />, pool: <FaSwimmingPool />, court: <FaTableTennis />,
  ground: <FaFutbol />, medical: <FaStethoscope />, computer: <FaLaptop />,
};

function getFacilityIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const [key, icon] of Object.entries(FACILITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <FaUniversity />;
}

export default function CollegeFacilities({ college }) {
  const facilities = college?.facilities || [];

  if (facilities.length === 0) {
    return (
      <div className={styles.section}>
        <h2 className={styles.title}>Facilities</h2>
        <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          No facilities information available yet.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Facilities</h2>
      <div className={styles.grid}>
        {facilities.map(f => {
          const name = typeof f === 'string' ? f : f.name;
          const desc = f.description;
          return (
            <div key={name || f._id} className={styles.facilityCard}>
              <span className={styles.icon}>{getFacilityIcon(name)}</span>
              <p className={styles.facilityName}>{name}</p>
              {desc && <p className={styles.description}>{desc}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}