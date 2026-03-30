import React, { useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useCreateComparison } from '../../hooks/queries';
import ComparisonSelector from './ComparisonSelector';
import ComparisonTable from './ComparisonTable';
import Button from '../common/Button/Button';
import styles from './ComparisonPage.module.css';

const TYPES = [
  { key: 'college', label: 'Colleges' },
  { key: 'course',  label: 'Courses'  },
  { key: 'exam',    label: 'Exams'    },
];

const ComparisonPage = () => {
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState('college');
  const [selectedItems, setSelectedItems] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const createComparisonMutation = useCreateComparison();

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
      setSaveStatus('Comparison saved!');
    } catch {
      setSaveStatus('Failed to save.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Compare</h1>
      <p className={styles.subtitle}>Select up to 4 items to compare side by side</p>

      {/* Type Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => handleTypeChange(t.key)}
            style={{
              padding: '0.45rem 1.2rem',
              borderRadius: '20px',
              border: '1px solid',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: type === t.key ? 'var(--gold, #C9A84C)' : 'transparent',
              color: type === t.key ? '#fff' : 'var(--charcoal, #1C1C1E)',
              borderColor: type === t.key ? 'var(--gold, #C9A84C)' : 'var(--border, #E8E3DB)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ComparisonSelector
        key={type}
        type={type}
        selectedItems={selectedItems}
        onAdd={addItem}
        onRemove={removeItem}
      />


      {selectedItems.length >= 2 && (
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
              {saveStatus && <span style={{ marginLeft: '1rem', fontSize: '0.875rem', color: '#10b981' }}>{saveStatus}</span>}
            </div>
          )}
        </>
      )}

      {selectedItems.length < 2 && selectedItems.length > 0 && (
        <p style={{ color: '#9ca3af', marginTop: '1rem', textAlign: 'center' }}>
          Add at least one more {type} to compare.
        </p>
      )}
    </div>
  );
};

export default ComparisonPage;
