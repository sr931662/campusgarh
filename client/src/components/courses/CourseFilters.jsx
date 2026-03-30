import React, { useState, useRef, useEffect } from 'react';
import {
  COURSE_CATEGORIES, COURSE_DISCIPLINES, COURSE_MODES,
  ADMISSION_TYPES, SALARY_RANGES,
} from '../../utils/constants';
import styles from './CourseFilters.module.css';

const EMPTY = { search: '', category: '', mode: '', discipline: '', admissionType: '', feesMin: '', feesMax: '', minSalary: '' };

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(o => !o)}>
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
      const val   = typeof opt === 'object' ? opt.value : opt;
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

const CourseFilters = ({ filters, onFilterChange, onReset }) => {
  const [local, setLocal] = useState({ ...EMPTY, ...filters });
  const debounceRef = useRef(null);

  // Sync when parent resets (all values become empty)
  useEffect(() => {
    const anyActive = Object.values(filters).some(v => v && v !== '');
    if (!anyActive) setLocal({ ...EMPTY });
  }, [filters]);

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

  const handleReset = () => {
    clearTimeout(debounceRef.current);
    setLocal({ ...EMPTY });
    onReset();
  };

  const activeCount = Object.values(local).filter(v => v && v !== '').length;

  return (
    <div className={styles.filters}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Filters {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </h3>
        {activeCount > 0 && (
          <button className={styles.resetBtn} onClick={handleReset}>Reset All</button>
        )}
      </div>

      <Section title="Search">
        <input
          type="text"
          value={local.search}
          onChange={(e) => setDebounced('search', e.target.value)}
          placeholder="Course name..."
          className={styles.input}
        />
      </Section>

      <Section title="Level / Category">
        <PillGroup
          options={COURSE_CATEGORIES}
          value={local.category}
          onChange={(v) => setInstant('category', v)}
        />
      </Section>

      <Section title="Discipline / Stream">
        <select
          value={local.discipline}
          onChange={(e) => setInstant('discipline', e.target.value)}
          className={styles.select}
        >
          <option value="">All Disciplines</option>
          {COURSE_DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Section>

      <Section title="Study Mode">
        <PillGroup
          options={COURSE_MODES}
          value={local.mode}
          onChange={(v) => setInstant('mode', v)}
        />
      </Section>

      <Section title="Admission Type" defaultOpen={false}>
        <PillGroup
          options={ADMISSION_TYPES}
          value={local.admissionType}
          onChange={(v) => setInstant('admissionType', v)}
        />
      </Section>

      <Section title="Annual Fees (₹)" defaultOpen={false}>
        <div className={styles.rangeGroup}>
          <input
            type="number"
            value={local.feesMin}
            onChange={(e) => setInstant('feesMin', e.target.value)}
            placeholder="Min"
            className={styles.rangeInput}
          />
          <span className={styles.rangeSep}>–</span>
          <input
            type="number"
            value={local.feesMax}
            onChange={(e) => setInstant('feesMax', e.target.value)}
            placeholder="Max"
            className={styles.rangeInput}
          />
        </div>
      </Section>

      <Section title="Avg Starting Salary" defaultOpen={false}>
        <PillGroup
          options={SALARY_RANGES}
          value={local.minSalary}
          onChange={(v) => setInstant('minSalary', v)}
        />
      </Section>
    </div>
  );
};

export default CourseFilters;
