import React from 'react';
import { Link } from 'react-router-dom';
import styles from './SavedColleges.module.css';

const SavedColleges = ({ colleges }) => {
  if (!colleges || colleges.length === 0) {
    return <div className={styles.empty}>No saved colleges yet.</div>;
  }
  return (
    <div>
      <h3>Saved Colleges</h3>
      <div className={styles.list}>
        {colleges.map((college) => (
          <Link key={college._id} to={`/colleges/${college.slug}`} className={styles.item}>
            {college.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SavedColleges;