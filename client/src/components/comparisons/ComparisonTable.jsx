import React from 'react';
import styles from './ComparisonTable.module.css';

const fmt    = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : 'N/A';
const fmtLPA = (n) => { if (!n) return 'N/A'; const v = Number(n); return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} LPA`; };

const COLLEGE_ROWS = [
  { label: 'Location',       get: c => `${c.contact?.city || ''}${c.contact?.state ? ', ' + c.contact.state : ''}` || 'N/A' },
  { label: 'NIRF Rank',      get: c => c.accreditation?.nirfRank || 'Not Ranked' },
  { label: 'NAAC Grade',     get: c => c.accreditation?.naacGrade || 'N/A' },
  { label: 'Total Fees/yr',  get: c => fmt(c.fees?.total) },
  { label: 'Avg Package',    get: c => fmtLPA(c.placementStats?.averagePackage) },
  { label: 'Placement %',    get: c => c.placementStats?.placementPercentage ? `${c.placementStats.placementPercentage}%` : 'N/A' },
  { label: 'Campus Type',    get: c => c.campusInfo?.campusType || 'N/A' },
  { label: 'Hostel',         get: c => c.hostel?.available ? 'Available' : 'N/A' },
];

const COURSE_ROWS = [
  { label: 'Level',          get: c => c.category || 'N/A' },
  { label: 'Discipline',     get: c => c.discipline || 'N/A' },
  { label: 'Duration',       get: c => c.duration || 'N/A' },
  { label: 'Mode',           get: c => c.mode || 'N/A' },
  { label: 'Fee Range/yr',   get: c => c.feeRange?.min || c.feeRange?.max ? `${fmt(c.feeRange.min)} – ${fmt(c.feeRange.max)}` : 'N/A' },
  { label: 'Eligibility',    get: c => c.eligibility || 'N/A' },
  { label: 'Admission Type', get: c => c.admissionType || 'N/A' },
];

const EXAM_ROWS = [
  { label: 'Category',          get: e => e.category || 'N/A' },
  { label: 'Level',             get: e => e.examLevel || 'N/A' },
  { label: 'Conducting Body',   get: e => e.conductingBody || 'N/A' },
  { label: 'Exam Mode',         get: e => e.examMode || 'N/A' },
  { label: 'Frequency',         get: e => e.frequency || 'N/A' },
  { label: 'Registration Fee',  get: e => e.registrationFee ? `₹${e.registrationFee}` : 'N/A' },
  { label: 'Official Website',  get: e => e.officialWebsite ? <a href={e.officialWebsite} target="_blank" rel="noreferrer" style={{ color: '#C9A84C' }}>Visit</a> : 'N/A' },
];

const ROWS_MAP = { college: COLLEGE_ROWS, course: COURSE_ROWS, exam: EXAM_ROWS };

const ComparisonTable = ({ type = 'college', items }) => {
  if (!items || items.length === 0) return null;
  const rows = ROWS_MAP[type] || COLLEGE_ROWS;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Parameter</th>
            {items.map(item => <th key={item._id}>{item.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td className={styles.paramLabel}>{row.label}</td>
              {items.map(item => <td key={item._id}>{row.get(item) ?? 'N/A'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
