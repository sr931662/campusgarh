import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collegeService } from '../../services/collegeService';
import Button from '../common/Button/Button';
import styles from './ComparisonSelector.module.css';

const ComparisonSelector = ({ selectedColleges, onAddCollege, onRemoveCollege, maxLimit = 4 }) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery(
    ['colleges-search', search],
    () => collegeService.getColleges({ search, limit: 5 }),
    { enabled: search.length > 2 }
  );

  const colleges = data?.data?.data || [];

  return (
    <div className={styles.selector}>
      <div className={styles.selected}>
        {selectedColleges.map((college) => (
          <div key={college._id} className={styles.selectedItem}>
            <span>{college.name}</span>
            <button onClick={() => onRemoveCollege(college._id)}>✕</button>
          </div>
        ))}
        {selectedColleges.length < maxLimit && (
          <div className={styles.addBox}>
            <input
              type="text"
              placeholder="Search colleges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>
      {search && colleges.length > 0 && (
        <div className={styles.searchResults}>
          {colleges.map((college) => (
            <div
              key={college._id}
              className={styles.resultItem}
              onClick={() => {
                onAddCollege(college);
                setSearch('');
              }}
            >
              {college.name} - {college.contact?.city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparisonSelector;