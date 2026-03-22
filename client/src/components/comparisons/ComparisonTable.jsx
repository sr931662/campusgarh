import React from 'react';
import styles from './ComparisonTable.module.css';
import { formatCurrency } from '../../utils/formatters';
import RatingStars from '../common/RatingStars/RatingStars';

const ComparisonTable = ({ colleges }) => {
  if (!colleges || colleges.length === 0) return null;

  const parameters = [
    { key: 'fees', label: 'Annual Fees', format: (v) => formatCurrency(v) },
    { key: 'ranking', label: 'NIRF Rank', format: (v) => v || 'N/A' },
    { key: 'placement', label: 'Average Package', format: (v) => formatCurrency(v) },
    { key: 'rating', label: 'Rating', format: (v) => <RatingStars rating={v} size="sm" /> },
  ];

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Parameter</th>
            {colleges.map((college) => (
              <th key={college._id}>{college.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.key}>
              <td className={styles.paramLabel}>{param.label}</td>
              {colleges.map((college) => {
                let value;
                if (param.key === 'fees') value = college.fees?.total;
                else if (param.key === 'ranking') {
                  const latestRank = college.rankings?.find(r => r.year === new Date().getFullYear()) || college.rankings?.[0];
                  value = latestRank?.rank;
                }
                else if (param.key === 'placement') value = college.placementStats?.averagePackage;
                else if (param.key === 'rating') value = college.averageRating || 0;
                return (
                  <td key={college._id}>
                    {param.format ? param.format(value) : value || 'N/A'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;