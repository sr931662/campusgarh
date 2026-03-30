import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useColleges, useCourses } from '../hooks/queries';
import CollegeCard from '../components/colleges/CollegeCard';
import CourseCard from '../components/courses/CourseCard';
import Loader from '../components/common/Loader/Loader';
import { parseQuery, describeIntent } from '../utils/searchNLP';
import styles from './SearchResults.module.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('colleges');

  // Parse raw query with NLP
  const parsed = useMemo(() => parseQuery(rawQuery), [rawQuery]);
  const intent = useMemo(() => describeIntent({ ...parsed, _raw: rawQuery }), [parsed, rawQuery]);

  // Build API params from parsed intent
  const collegeParams = {
    search: parsed.q || undefined,
    city: parsed.city || undefined,
    type: parsed.collegeType || undefined,
    fundingType: parsed.fundingType || undefined,
    feesMax: parsed.feesMax || undefined,
    limit: 12,
  };

  const courseParams = {
    search: parsed.q || undefined,
    category: parsed.category || undefined,
    feesMax: parsed.feesMax || undefined,
    limit: 12,
  };

  const { data: collegesData, isLoading: collegesLoading } = useColleges(collegeParams);
  const { data: coursesData,  isLoading: coursesLoading  } = useCourses(courseParams);

  const colleges = collegesData?.data?.data?.data || [];
  const courses  = coursesData?.data?.data?.data  || [];

  if (!rawQuery) {
    return <div className={styles.noQuery}>Enter a search term to find colleges and courses.</div>;
  }

  const isLoading = (activeTab === 'colleges' && collegesLoading) || (activeTab === 'courses' && coursesLoading);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Results for "{rawQuery}"</h1>

      {/* Intent summary chips */}
      {intent && (
        <div className={styles.intentBar}>
          <span className={styles.intentLabel}>Searching for:</span>
          {intent.split(' · ').map((chip, i) => (
            <span key={i} className={styles.chip}>{chip}</span>
          ))}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'colleges' ? styles.active : ''}`}
          onClick={() => setActiveTab('colleges')}
        >
          Colleges ({colleges.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'courses' ? styles.active : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses ({courses.length})
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : activeTab === 'colleges' ? (
        colleges.length === 0
          ? <p className={styles.empty}>No colleges found. Try a different search.</p>
          : <div className={styles.grid}>{colleges.map(c => <CollegeCard key={c._id} college={c} />)}</div>
      ) : (
        courses.length === 0
          ? <p className={styles.empty}>No courses found. Try a different search.</p>
          : <div className={styles.grid}>{courses.map(c => <CourseCard key={c._id} course={c} />)}</div>
      )}
    </div>
  );
};

export default SearchResults;
