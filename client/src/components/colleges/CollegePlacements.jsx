import { formatCurrency } from '../../utils/formatters';
import styles from './CollegePlacements.module.css';

export default function CollegePlacements({ college }) {
  if (!college) return null;

  const ps  = college.placementStats || {};
  const yps = college.yearWisePlacements || [];

  // Use the most recent year's data if available, else fall back to placementStats
  const latest = yps.length
    ? [...yps].sort((a, b) => (b.year || 0) - (a.year || 0))[0]
    : null;

  const avgPkg  = latest?.averagePackage  ?? ps.averagePackage;
  const maxPkg  = latest?.highestPackage  ?? ps.highestPackage;
  const medPkg  = latest?.medianPackage   ?? ps.medianPackage;
  const pctPlaced = latest?.placementPercentage ?? ps.placementPercentage;
  const topRecruiters = latest?.topRecruiters ?? ps.topRecruiters ?? [];

  const hasData = avgPkg || maxPkg || pctPlaced || topRecruiters.length || yps.length;

  if (!hasData) {
    return (
      <div className={styles.section}>
        <h2 className={styles.title}>Placements</h2>
        <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
          No placement data available yet.
        </p>
      </div>
    );
  }

  const sectorWise = ps.sectorWise
    ? (ps.sectorWise instanceof Map
        ? Array.from(ps.sectorWise.entries())
        : Object.entries(ps.sectorWise))
    : [];

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Placements {latest?.year ? `(${latest.year})` : ''}</h2>

      {/* Stats */}
      <div className={styles.stats}>
        {pctPlaced && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Placement Rate</span>
            <span className={styles.statValue}>{pctPlaced}%</span>
          </div>
        )}
        {avgPkg && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Avg Package</span>
            <span className={styles.statValue}>{formatCurrency(avgPkg)}</span>
          </div>
        )}
        {maxPkg && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Highest Package</span>
            <span className={styles.statValue}>{formatCurrency(maxPkg)}</span>
          </div>
        )}
        {medPkg && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Median Package</span>
            <span className={styles.statValue}>{formatCurrency(medPkg)}</span>
          </div>
        )}
        {(latest?.totalStudents || latest?.placedStudents) && (
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Students Placed</span>
            <span className={styles.statValue}>
              {latest.placedStudents ?? '—'} / {latest.totalStudents ?? '—'}
            </span>
          </div>
        )}
      </div>

      {/* Top Recruiters */}
      {topRecruiters.length > 0 && (
        <div className={styles.recruiters}>
          <h3>Top Recruiters</h3>
          <div className={styles.recruitersList}>
            {topRecruiters.map(r => (
              <span key={r} className={styles.recruiterTag}>{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Sector-wise */}
      {sectorWise.length > 0 && (
        <div className={styles.sectors}>
          <h3>Sector-wise Distribution</h3>
          <div className={styles.sectorGrid}>
            {sectorWise.map(([sector, pct]) => (
              <div key={sector} className={styles.sectorItem}>
                <span className={styles.sectorName}>{sector}</span>
                <div className={styles.progressBar}>
                  <div className={styles.progress} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className={styles.sectorPercentage}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year-wise history */}
      {yps.length > 1 && (
        <div className={styles.history}>
          <h3>Year-wise Placement History</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Avg Package</th>
                  <th>Highest</th>
                  <th>Placement %</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {[...yps].sort((a, b) => (b.year || 0) - (a.year || 0)).map((y, i) => (
                  <tr key={i}>
                    <td>{y.year || '—'}</td>
                    <td>{y.averagePackage ? formatCurrency(y.averagePackage) : '—'}</td>
                    <td>{y.highestPackage ? formatCurrency(y.highestPackage) : '—'}</td>
                    <td>{y.placementPercentage ? `${y.placementPercentage}%` : '—'}</td>
                    <td>{y.placedStudents ?? '—'} / {y.totalStudents ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}