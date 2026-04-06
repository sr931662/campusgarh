import React, { useState, useRef } from 'react';
import {
  COLLEGE_TYPES, FUNDING_TYPES, NAAC_GRADES, APPROVED_BY_OPTIONS,
  CAMPUS_TYPES, ADMISSION_MODES, PLACEMENT_RANGES,
  PACKAGE_RANGES, INDIAN_STATES,
} from '../../utils/constants';
import styles from './CollegeFilters.module.css';

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
};

const PillGroup = ({ options, value, onChange }) => (
  <div className={styles.pillGroup}>
    {options.map((opt) => {
      const val = typeof opt === 'object' ? opt.value : opt;
      const label = typeof opt === 'object' ? opt.label : opt;
      return (
        <button
          key={val}
          className={`${styles.pill} ${value === val ? styles.pillActive : ''}`}
          onClick={() => onChange(value === val ? '' : val)}
        >
          {label}
        </button>
      );
    })}
  </div>
);

const CollegeFilters = ({ filters, onFilterChange, onReset, onClose }) => {
  const [local, setLocal] = useState(filters);

  const debounceRef = useRef(null);

  const setInstant = (field, value) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    onFilterChange(next);
  };

  const setDebounced = (field, value) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onFilterChange(next), 450);
  };

  // approvedBy is stored as comma-separated string; toggle individual body
  const toggleApproval = (body) => {
    const current = local.approvedBy ? local.approvedBy.split(',').map(s => s.trim()).filter(Boolean) : [];
    const next = current.includes(body) ? current.filter(b => b !== body) : [...current, body];
    setInstant('approvedBy', next.join(','));
  };

  const handleReset = () => {
    clearTimeout(debounceRef.current);
    setLocal({});
    onReset();
  };

  const approvedByArr = local.approvedBy ? local.approvedBy.split(',').map(s => s.trim()).filter(Boolean) : [];

  const activeCount = Object.values(local).filter(v => v && v !== '').length;

  return (
    <div className={styles.filters}>
      <div className={styles.drawerHandle} />
      {onClose && (
        <div className={styles.mobileCloseRow}>
          <button className={styles.mobileCloseBtn} onClick={onClose}>Done</button>
        </div>
      )}
      <div className={styles.header}>
        <h3 className={styles.title}>
          Filters {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </h3>
        <button className={styles.resetBtn} onClick={handleReset}>Reset All</button>
      </div>

      {/* Search */}
      <Section title="Search">
        <input
          type="text"
          value={local.search || ''}
          onChange={(e) => setDebounced('search', e.target.value)}
          placeholder="College name..."
          className={styles.input}
        />
      </Section>

      {/* Location */}
      <Section title="Location">
        <label className={styles.label}>State</label>
        <select
          value={local.state || ''}
          onChange={(e) => setInstant('state', e.target.value)}
          className={styles.select}
        >
          <option value="">All States</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className={styles.label} style={{ marginTop: '0.75rem' }}>City</label>
        <input
          type="text"
          value={local.city || ''}
          onChange={(e) => setDebounced('city', e.target.value)}
          placeholder="e.g. Mumbai, Pune"
          className={styles.input}
        />
      </Section>

      {/* Discipline Type */}
      <Section title="Discipline / Stream">
        <select
          value={local.type || ''}
          onChange={(e) => setInstant('type', e.target.value)}
          className={styles.select}
        >
          <option value="">All Disciplines</option>
          {COLLEGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Section>

      {/* Institute Type */}
      <Section title="Institute Type">
        <select
          value={local.fundingType || ''}
          onChange={(e) => setInstant('fundingType', e.target.value)}
          className={styles.select}
        >
          <option value="">All Institute Types</option>
          {FUNDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Section>

      {/* Accreditation */}
      <Section title="Accreditation">
        <label className={styles.label}>NAAC Grade</label>
        <PillGroup options={NAAC_GRADES} value={local.naacGrade || ''} onChange={(v) => setInstant('naacGrade', v)} />
        <div className={styles.toggleRow} style={{ marginTop: '0.875rem' }}>
          <span className={styles.toggleLabel}>NBA Accredited Only</span>
          <button
            className={`${styles.toggle} ${local.nbaStatus === 'true' ? styles.toggleOn : ''}`}
            onClick={() => setInstant('nbaStatus', local.nbaStatus === 'true' ? '' : 'true')}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </Section>

      {/* Approved By */}
      <Section title="Approved By" defaultOpen={false}>
        <div className={styles.checkList}>
          {APPROVED_BY_OPTIONS.map((body) => (
            <label key={body} className={styles.checkRow}>
              <input
                type="checkbox"
                checked={approvedByArr.includes(body)}
                onChange={() => toggleApproval(body)}
                className={styles.checkbox}
              />
              <span>{body}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Fees Range */}
      <Section title="Annual Fees (₹)" defaultOpen={false}>
        <div className={styles.rangeGroup}>
          <input
            type="number"
            value={local.feesMin || ''}
            onChange={(e) => setInstant('feesMin', e.target.value)}
            placeholder="Min"
            className={styles.rangeInput}
          />
          <span className={styles.rangeSep}>–</span>
          <input
            type="number"
            value={local.feesMax || ''}
            onChange={(e) => setInstant('feesMax', e.target.value)}
            placeholder="Max"
            className={styles.rangeInput}
          />
        </div>
      </Section>

      {/* NIRF Rank */}
      <Section title="NIRF Rank" defaultOpen={false}>
        <label className={styles.hint}>Show colleges ranked within:</label>
        <PillGroup
          options={[
            { label: 'Top 10', value: '10' },
            { label: 'Top 25', value: '25' },
            { label: 'Top 50', value: '50' },
            { label: 'Top 100', value: '100' },
            { label: 'Top 200', value: '200' },
          ]}
          value={local.ranking || ''}
          onChange={(v) => setInstant('ranking', v)}
        />
      </Section>

      {/* Placements */}
      <Section title="Placements" defaultOpen={false}>
        <label className={styles.label}>Min Placement %</label>
        <PillGroup options={PLACEMENT_RANGES} value={local.minPlacement || ''} onChange={(v) => setInstant('minPlacement', v)} />
        <label className={styles.label} style={{ marginTop: '0.875rem' }}>Min Avg Package</label>
        <PillGroup options={PACKAGE_RANGES} value={local.minPackage || ''} onChange={(v) => setInstant('minPackage', v)} />
      </Section>

      {/* Campus */}
      <Section title="Campus Type" defaultOpen={false}>
        <PillGroup options={CAMPUS_TYPES} value={local.campusType || ''} onChange={(v) => setInstant('campusType', v)} />
      </Section>

      {/* Admission */}
      <Section title="Admission Mode" defaultOpen={false}>
        <PillGroup options={ADMISSION_MODES} value={local.admissionMode || ''} onChange={(v) => setInstant('admissionMode', v)} />
      </Section>

      {/* Other */}
      <Section title="Other" defaultOpen={false}>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Verified Colleges Only</span>
          <button
            className={`${styles.toggle} ${local.isVerified === 'true' ? styles.toggleOn : ''}`}
            onClick={() => setInstant('isVerified', local.isVerified === 'true' ? '' : 'true')}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.toggleRow} style={{ marginTop: '0.75rem' }}>
          <span className={styles.toggleLabel}>Featured Colleges Only</span>
          <button
            className={`${styles.toggle} ${local.featured === 'true' ? styles.toggleOn : ''}`}
            onClick={() => setInstant('featured', local.featured === 'true' ? '' : 'true')}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
      </Section>
    </div>
  );
};

export default CollegeFilters;
