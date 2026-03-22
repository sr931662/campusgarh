import { FaMale, FaFemale, FaUtensils, FaMapMarkerAlt } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import styles from './CollegeHostelCampus.module.css';

export default function CollegeHostelCampus({ college }) {
  if (!college) return null;

  const hostel = college.hostel || {};
  const campus = college.campusInfo || {};
  const infra  = college.infrastructure || {};

  return (
    <div className={styles.wrapper}>
      {/* ── HOSTEL ── */}
      <h2 className={styles.sectionTitle}>Hostel & Accommodation</h2>

      {hostel.available === false && !hostel.boysCapacity && !hostel.girlsCapacity ? (
        <p className={styles.emptyMsg}>No hostel information available.</p>
      ) : (
        <>
          <div className={styles.hostelGrid}>
            {hostel.boysCapacity > 0 && (
              <div className={styles.hostelCard}>
                <p className={styles.hostelCardHeader}><FaMale /> Boys Hostel</p>
                <p>Capacity: {hostel.boysCapacity} seats</p>
                {hostel.annualFee > 0 && <p>Annual Fee: {formatCurrency(hostel.annualFee)}</p>}
              </div>
            )}
            {hostel.girlsCapacity > 0 && (
              <div className={styles.hostelCard}>
                <p className={styles.hostelCardHeader}><FaFemale /> Girls Hostel</p>
                <p>Capacity: {hostel.girlsCapacity} seats</p>
                {hostel.annualFee > 0 && <p>Annual Fee: {formatCurrency(hostel.annualFee)}</p>}
              </div>
            )}
            {hostel.messCharges > 0 && (
              <div className={styles.hostelCard}>
                <p className={styles.hostelCardHeader}><FaUtensils /> Mess</p>
                <p>Charges: {formatCurrency(hostel.messCharges)}</p>
              </div>
            )}
          </div>

          {hostel.distanceFromCampus && (
            <p className={styles.distanceNote}><FaMapMarkerAlt /> Distance from campus: {hostel.distanceFromCampus}</p>
          )}

          {hostel.facilities?.length > 0 && (
            <div className={styles.facilityRow}>
              <h3 className={styles.subTitle}>Hostel Facilities</h3>
              <div className={styles.tagList}>
                {hostel.facilities.map(f => <span key={f} className={styles.tag}>{f}</span>)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CAMPUS INFO ── */}
      {Object.values(campus).some(v => v) && (
        <>
          <h2 className={styles.sectionTitleSpaced}>Campus</h2>
          <div className={styles.statsGrid}>
            {campus.totalArea          && <Stat label="Total Area"      value={campus.totalArea} />}
            {campus.campusType         && <Stat label="Campus Type"     value={campus.campusType} />}
            {campus.totalStudents      && <Stat label="Total Students"  value={campus.totalStudents.toLocaleString('en-IN')} />}
            {campus.totalFaculty       && <Stat label="Total Faculty"   value={campus.totalFaculty} />}
            {campus.studentFacultyRatio && <Stat label="S:F Ratio"      value={campus.studentFacultyRatio} />}
            {campus.departments        && <Stat label="Departments"     value={campus.departments} />}
          </div>
          {campus.recognitions?.length > 0 && (
            <div className={styles.facilityRow}>
              <h3 className={styles.subTitle}>Recognitions & Awards</h3>
              <div className={styles.tagList}>
                {campus.recognitions.map(r => <span key={r} className={styles.tagGold}>{r}</span>)}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── INFRASTRUCTURE ── */}
      {Object.values(infra).some(v => v) && (
        <>
          <h2 className={styles.sectionTitleSpaced}>Infrastructure</h2>
          <div className={styles.statsGrid}>
            {infra.totalBuildings    && <Stat label="Buildings"      value={infra.totalBuildings} />}
            {infra.classroomCount    && <Stat label="Classrooms"     value={infra.classroomCount} />}
            {infra.laboratoryCount   && <Stat label="Laboratories"   value={infra.laboratoryCount} />}
            {infra.libraryBooks      && <Stat label="Library Books"  value={infra.libraryBooks.toLocaleString('en-IN')} />}
            {infra.computerCount     && <Stat label="Computers"      value={infra.computerCount} />}
            {infra.auditoriumCapacity && <Stat label="Auditorium"    value={`${infra.auditoriumCapacity} seats`} />}
            {infra.cafeteriaCount    && <Stat label="Cafeterias"     value={infra.cafeteriaCount} />}
            {infra.hasOwnHospital    && <Stat label="Hospital"       value="On Campus" />}
          </div>
          {infra.sportsGrounds?.length > 0 && (
            <div className={styles.facilityRow}>
              <h3 className={styles.subTitle}>Sports Grounds</h3>
              <div className={styles.tagList}>
                {infra.sportsGrounds.map(s => <span key={s} className={styles.tagGreen}>{s}</span>)}
              </div>
            </div>
          )}
        </>
      )}

      {!Object.values(hostel).some(v => v) &&
       !Object.values(campus).some(v => v) &&
       !Object.values(infra).some(v => v) && (
        <p className={styles.emptyMsg}>No hostel or campus information available yet.</p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}