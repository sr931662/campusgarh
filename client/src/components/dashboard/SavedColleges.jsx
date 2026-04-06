import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SavedColleges.module.css';

const Wishlist = ({ colleges = [], courses = [] }) => {
  const [tab, setTab] = useState('colleges');

  const isEmpty = colleges.length === 0 && courses.length === 0;

  if (isEmpty) {
    return (
      <div>
        <h3 className={styles.title}>My Wishlist</h3>
        <div className={styles.empty}>No saved colleges or courses yet. Browse and save items you like!</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className={styles.title}>My Wishlist</h3>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'colleges' ? styles.tabActive : ''}`}
          onClick={() => setTab('colleges')}
        >
          Colleges ({colleges.length})
        </button>
        <button
          className={`${styles.tab} ${tab === 'courses' ? styles.tabActive : ''}`}
          onClick={() => setTab('courses')}
        >
          Courses ({courses.length})
        </button>
      </div>

      {tab === 'colleges' && (
        <div className={styles.list}>
          {colleges.length === 0 ? (
            <div className={styles.empty}>No saved colleges yet.</div>
          ) : colleges.map((college) => (
            <Link key={college._id} to={`/colleges/${college.slug}`} className={styles.item}>
              <span className={styles.itemName}>{college.name}</span>
              {college.contact?.city && <span className={styles.itemMeta}>{college.contact.city}</span>}
            </Link>
          ))}
        </div>
      )}

      {tab === 'courses' && (
        <div className={styles.list}>
          {courses.length === 0 ? (
            <div className={styles.empty}>No saved courses yet.</div>
          ) : courses.map((course) => (
            <Link key={course._id} to={`/courses/${course.slug}`} className={styles.item}>
              <span className={styles.itemName}>{course.name}</span>
              {course.category && <span className={styles.itemMeta}>{course.category}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
