import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useColleges, useCourses } from '../hooks/queries';
import CollegeCard from '../components/colleges/CollegeCard';
import CourseCard from '../components/courses/CourseCard';
import Loader from '../components/common/Loader/Loader';
import styles from './SearchResults.module.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('colleges');

  const { data: collegesData, isLoading: collegesLoading } = useColleges({ search: query, limit: 6 });
  const { data: coursesData, isLoading: coursesLoading } = useCourses({ search: query, limit: 6 });

  const colleges = collegesData?.data?.data?.data || [];
  const courses = coursesData?.data?.data?.data || [];

  if (!query) {
    return <div className={styles.noQuery}>Enter a search term to find colleges and courses.</div>;
  }

  const isLoading = (activeTab === 'colleges' && collegesLoading) || (activeTab === 'courses' && coursesLoading);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search Results for "{query}"</h1>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'colleges' ? styles.active : ''}`} onClick={() => setActiveTab('colleges')}>
          Colleges ({colleges.length})
        </button>
        <button className={`${styles.tab} ${activeTab === 'courses' ? styles.active : ''}`} onClick={() => setActiveTab('courses')}>
          Courses ({courses.length})
        </button>
      </div>
      {isLoading ? (
        <Loader />
      ) : activeTab === 'colleges' ? (
        <div className={styles.grid}>
          {colleges.map(college => <CollegeCard key={college._id} college={college} />)}
        </div>
      ) : (
        <div className={styles.grid}>
          {courses.map(course => <CourseCard key={course._id} course={course} />)}
        </div>
      )}
    </div>
  );
};

export default SearchResults;