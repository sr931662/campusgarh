import React, { useState } from 'react';
import styles from './ExamFilters.module.css';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { EXAM_LEVELS, EXAM_MODES } from '../../utils/constants';

const ExamFilters = ({ filters, onChange, onReset, activeCount, onClose }) => {
  const [expanded, setExpanded] = useState({
    category: true,
    level: true,
    mode: true,
    conductingBody: false,
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handlePillChange = (key, value) => {
    const current = filters[key] || '';
    const newValue = current === value ? '' : value;
    onChange({ ...filters, [key]: newValue });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.drawerHandle} />
      {onClose && (
        <div className={styles.mobileCloseRow}>
          <button className={styles.mobileCloseBtn} onClick={onClose}>Done</button>
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.title}>
          <FaFilter /> Filters
          {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
        </div>
        {activeCount > 0 && (
          <button className={styles.resetBtn} onClick={onReset}>Reset all</button>
        )}
      </div>

      {/* Category (UG/PG/Diploma...) */}
      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('category')}>
          <span>Exam Category</span>
          {expanded.category ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expanded.category && (
          <div className={styles.sectionBody}>
            <div className={styles.pillGroup}>
              {['UG', 'PG', 'PhD', 'Diploma'].map(cat => (
                <button
                  key={cat}
                  className={`${styles.pill} ${filters.category === cat ? styles.pillActive : ''}`}
                  onClick={() => handlePillChange('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exam Level */}
      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('level')}>
          <span>Exam Level</span>
          {expanded.level ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expanded.level && (
          <div className={styles.sectionBody}>
            <div className={styles.pillGroup}>
              {EXAM_LEVELS.map(level => (
                <button
                  key={level}
                  className={`${styles.pill} ${filters.examLevel === level ? styles.pillActive : ''}`}
                  onClick={() => handlePillChange('examLevel', level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exam Mode */}
      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('mode')}>
          <span>Exam Mode</span>
          {expanded.mode ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expanded.mode && (
          <div className={styles.sectionBody}>
            <div className={styles.pillGroup}>
              {EXAM_MODES.map(mode => (
                <button
                  key={mode}
                  className={`${styles.pill} ${filters.examMode === mode ? styles.pillActive : ''}`}
                  onClick={() => handlePillChange('examMode', mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conducting Body (text input) */}
      <div className={styles.section}>
        <button className={styles.sectionHeader} onClick={() => toggleSection('conductingBody')}>
          <span>Conducting Body</span>
          {expanded.conductingBody ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expanded.conductingBody && (
          <div className={styles.sectionBody}>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., NTA, IIT Bombay"
              value={filters.conductingBody || ''}
              onChange={(e) => handleChange('conductingBody', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Upcoming toggle */}
      <div className={styles.section}>
        <div className={styles.sectionBody}>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Show only upcoming exams</span>
            <button
              className={`${styles.toggle} ${filters.upcoming === 'true' ? styles.toggleOn : ''}`}
              onClick={() => handleChange('upcoming', filters.upcoming === 'true' ? '' : 'true')}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamFilters;