import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaBook } from 'react-icons/fa';
import { useExams } from '../../hooks/queries';
import ExamCard from './ExamCard';
import ExamFilters from './ExamFilters';
import Loader from '../common/Loader/Loader';
import Pagination from '../common/Pagination/Pagination';
import styles from './ExamList.module.css';
import { FaSort } from 'react-icons/fa';

const ExamList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    examLevel: searchParams.get('examLevel') || '',
    examMode: searchParams.get('examMode') || '',
    conductingBody: searchParams.get('conductingBody') || '',
    upcoming: searchParams.get('upcoming') || '',
    sort: searchParams.get('sort') || 'date_asc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
  });

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') params[key] = value;
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data, isLoading, error } = useExams(filters);
  const { data: exams = [], pagination } = data?.data?.data || {};

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      examLevel: '',
      examMode: '',
      conductingBody: '',
      upcoming: '',
      sort: 'date_asc',
      page: 1,
      limit: 12,
    });
  };

  const handleSort = (e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }));
  };

  const activeFilterCount = Object.entries(filters).filter(([key, val]) =>
    ['category', 'examLevel', 'examMode', 'conductingBody', 'upcoming'].includes(key) && val
  ).length;

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerInner}>
          <p className={styles.bannerEyebrow}>Dates · Eligibility · Colleges</p>
          <h1 className={styles.bannerTitle}>Entrance <em>Exams</em></h1>
          <p className={styles.bannerSubtitle}>Track every national and state entrance exam — important dates, eligibility criteria, and accepting colleges.</p>
        </div>
      </section>

      {error ? (
        <div className={styles.errorWrap}>Failed to load exams</div>
      ) : (
        <div className={styles.container}>
          {filterOpen && <div className={styles.backdrop} onClick={() => setFilterOpen(false)} />}
          <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
            <ExamFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleReset}
              activeCount={activeFilterCount}
              onClose={() => setFilterOpen(false)}
            />
          </aside>

          <main className={styles.content}>
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <div>
                  <h2 className={styles.title}>Entrance Exams</h2>
                  <p className={styles.subtitle}>
                    {isLoading ? 'Searching...' : 'Find details, dates, and colleges accepting each exam'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className={styles.mobileFilterBtn} onClick={() => setFilterOpen(true)}>
                    Filters
                    {activeFilterCount > 0 && (
                      <span className={styles.mobileFilterBadge}>{activeFilterCount}</span>
                    )}
                  </button>
                  <div className={styles.sortBar}>
                    <FaSort className={styles.sortIcon} />
                    <select value={filters.sort} onChange={handleSort} className={styles.sortSelect}>
                      <option value="date_asc">Exam Date (Earliest)</option>
                      <option value="date_desc">Exam Date (Latest)</option>
                      <option value="name_asc">Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className={styles.activeFilters}>
                  {filters.category && <div className={styles.filterChip}>Category: {filters.category}<button onClick={() => handleFilterChange({ category: '' })}>×</button></div>}
                  {filters.examLevel && <div className={styles.filterChip}>Level: {filters.examLevel}<button onClick={() => handleFilterChange({ examLevel: '' })}>×</button></div>}
                  {filters.examMode && <div className={styles.filterChip}>Mode: {filters.examMode}<button onClick={() => handleFilterChange({ examMode: '' })}>×</button></div>}
                  {filters.conductingBody && <div className={styles.filterChip}>Conducting Body: {filters.conductingBody}<button onClick={() => handleFilterChange({ conductingBody: '' })}>×</button></div>}
                  {filters.upcoming === 'true' && <div className={styles.filterChip}>Upcoming Only<button onClick={() => handleFilterChange({ upcoming: '' })}>×</button></div>}
                </div>
              )}
            </div>

            {isLoading ? (
              <Loader />
            ) : exams.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FaBook /></div>
                <h3 className={styles.emptyTitle}>No exams found</h3>
                <p className={styles.emptyText}>Try adjusting your filters or search term.</p>
                <button className={styles.emptyReset} onClick={handleReset}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {Array.isArray(exams) && exams.map((exam) => (
                    <ExamCard key={exam._id} exam={exam} />
                  ))}
                </div>
                {pagination && (
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );

};

export default ExamList;