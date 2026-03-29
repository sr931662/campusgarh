import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collegeService } from '../../services/collegeService';
import { courseService } from '../../services/courseService';
import { examService } from '../../services/examService';
import styles from './ComparisonSelector.module.css';

const ComparisonSelector = ({ type, selectedItems, onAdd, onRemove, maxLimit = 4 }) => {
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: [`compare-search-${type}`, search],
    queryFn: () => {
      if (type === 'college') return collegeService.getColleges({ search, limit: 6 });
      if (type === 'course')  return courseService.getCourses({ search, limit: 6 });
      return examService.getExams({ search, limit: 6 });
    },
    enabled: search.length > 2,
  });

  const raw = data?.data?.data;
  const results = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  const getSubtitle = (item) => {
    if (type === 'college') return item.contact?.city || '';
    if (type === 'course')  return item.duration || item.category || '';
    return item.conductingBody || item.category || '';
  };

  return (
    <div className={styles.selector}>
      <div className={styles.selected}>
        {selectedItems.map((item) => (
          <div key={item._id} className={styles.selectedItem}>
            <span>{item.name}</span>
            <button onClick={() => onRemove(item._id)}>✕</button>
          </div>
        ))}
        {selectedItems.length < maxLimit && (
          <div className={styles.addBox}>
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {search.length > 2 && results.length > 0 && (
        <div className={styles.searchResults}>
          {results
            .filter(item => !selectedItems.find(s => s._id === item._id))
            .map((item) => (
              <div
                key={item._id}
                className={styles.resultItem}
                onClick={() => { onAdd(item); setSearch(''); }}
              >
                <strong>{item.name}</strong>
                {getSubtitle(item) && <span style={{ color: '#6b7280', fontSize: '0.82rem', marginLeft: '0.4rem' }}>— {getSubtitle(item)}</span>}
              </div>
            ))}
        </div>
      )}

      {search.length > 2 && results.length === 0 && (
        <div className={styles.searchResults}>
          <div className={styles.resultItem} style={{ color: '#9ca3af' }}>No results found</div>
        </div>
      )}
    </div>
  );
};

export default ComparisonSelector;
