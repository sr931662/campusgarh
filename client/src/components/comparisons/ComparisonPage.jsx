import React, { useState } from 'react';
import { FaUniversity, FaGraduationCap, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../store/authStore';
import { useCreateComparison } from '../../hooks/queries';
import ComparisonSelector from './ComparisonSelector';
import ComparisonTable from './ComparisonTable';
import Button from '../common/Button/Button';
import styles from './ComparisonPage.module.css';

const TYPES = [
  { key: 'college', label: 'Colleges', icon: <FaUniversity />, desc: 'Compare fees, placements, rankings & more' },
  { key: 'course',  label: 'Courses',  icon: <FaGraduationCap />, desc: 'Compare duration, eligibility & fee ranges' },
  { key: 'exam',    label: 'Exams',    icon: <FaFileAlt />, desc: 'Compare exam modes, frequency & fees' },
];

const ComparisonPage = () => {
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState('college');
  const [selectedItems, setSelectedItems] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const createComparisonMutation = useCreateComparison();

  const activeType = TYPES.find(t => t.key === type);

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedItems([]);
    setSaveStatus('');
  };

  const addItem = (item) => {
    if (selectedItems.length >= 4) return;
    if (!selectedItems.find(i => i._id === item._id)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id) => setSelectedItems(prev => prev.filter(i => i._id !== id));

  const saveComparison = async () => {
    if (selectedItems.length < 2) return;
    const ids = selectedItems.map(i => i._id);
    const payload = { type };
    if (type === 'college') payload.collegeIds = ids;
    else if (type === 'course') payload.courseIds = ids;
    else payload.examIds = ids;

    try {
      await createComparisonMutation.mutateAsync(payload);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Side-by-side comparison</p>
          <h1 className={styles.heroTitle}>Compare &amp; Decide</h1>
          <p className={styles.heroDesc}>
            Add up to 4 {activeType?.label.toLowerCase()} and compare them across all key parameters to make the right choice.
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── Type Tabs ── */}
        <div className={styles.typeGroup}>
          {TYPES.map(t => (
            <button
              key={t.key}
              className={`${styles.typeTab} ${type === t.key ? styles.typeTabActive : ''}`}
              onClick={() => handleTypeChange(t.key)}
            >
              <span className={styles.typeIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Selector ── */}
        <div className={styles.selectorWrap}>
          <div className={styles.selectorLabel}>
            <span className={styles.selectorCount}>
              {selectedItems.length} / 4 selected
            </span>
            {selectedItems.length < 2 && (
              <span className={styles.selectorHint}>Add at least 2 {activeType?.label.toLowerCase()} to compare</span>
            )}
          </div>
          <ComparisonSelector
            key={type}
            type={type}
            selectedItems={selectedItems}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </div>

        {/* ── Comparison Table ── */}
        {selectedItems.length >= 2 ? (
          <>
            <ComparisonTable type={type} items={selectedItems} />

            {isAuthenticated && (
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={saveComparison}
                  loading={createComparisonMutation.isPending}
                >
                  Save Comparison
                </Button>
                {saveStatus === 'saved' && (
                  <span className={styles.saveSuccess}>Comparison saved successfully!</span>
                )}
                {saveStatus === 'error' && (
                  <span className={styles.saveError}>Failed to save. Please try again.</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{activeType?.icon}</div>
            <h3 className={styles.emptyTitle}>No comparison yet</h3>
            <p className={styles.emptyDesc}>{activeType?.desc}</p>
            <div className={styles.emptySteps}>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>1</span>
                <span>Search for a {activeType?.label.slice(0, -1).toLowerCase()}</span>
              </div>
              <div className={styles.emptyStepArrow}>→</div>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>2</span>
                <span>Add at least 2 items</span>
              </div>
              <div className={styles.emptyStepArrow}>→</div>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>3</span>
                <span>Compare side by side</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;
