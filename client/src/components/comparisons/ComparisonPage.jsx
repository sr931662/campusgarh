import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/authStore';
import { useCreateComparison, useUserComparisons } from '../../hooks/queries';
import ComparisonSelector from './ComparisonSelector';
import ComparisonTable from './ComparisonTable';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import styles from './ComparisonPage.module.css';

const ComparisonPage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [comparisonId, setComparisonId] = useState(null);
  const createComparisonMutation = useCreateComparison();
  const { data: comparisonsData, isLoading: comparisonsLoading } = useUserComparisons();

  const addCollege = (college) => {
    if (selectedColleges.length >= 4) return;
    if (!selectedColleges.find(c => c._id === college._id)) {
      setSelectedColleges([...selectedColleges, college]);
    }
  };

  const removeCollege = (collegeId) => {
    setSelectedColleges(selectedColleges.filter(c => c._id !== collegeId));
  };

  const saveComparison = async () => {
    if (selectedColleges.length < 2) return;
    const collegeIds = selectedColleges.map(c => c._id);
    try {
      const result = await createComparisonMutation.mutateAsync({ collegeIds });
      setComparisonId(result.data._id);
    } catch (error) {
      // handle
    }
  };

  useEffect(() => {
    if (comparisonsData && comparisonsData.data?.data?.length > 0) {
      // optional: load last comparison
    }
  }, [comparisonsData]);

  if (comparisonsLoading) return <Loader />;

  return (
    <div className={styles.container}>
      <h1>Compare Colleges</h1>
      <p className={styles.subtitle}>Select up to 4 colleges to compare side by side</p>

      <ComparisonSelector
        selectedColleges={selectedColleges}
        onAddCollege={addCollege}
        onRemoveCollege={removeCollege}
      />

      {selectedColleges.length >= 2 && (
        <>
          <ComparisonTable colleges={selectedColleges} />
          {isAuthenticated && (
            <div className={styles.actions}>
              <Button
                variant="primary"
                onClick={saveComparison}
                loading={createComparisonMutation.isPending}
              >
                Save Comparison
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComparisonPage;