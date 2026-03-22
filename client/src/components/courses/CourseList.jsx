import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCourses } from '../../hooks/queries';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import Loader from '../common/Loader/Loader';
import styles from './CourseList.module.css';

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    mode: searchParams.get('mode') || '',
    discipline: searchParams.get('discipline') || '',
    admissionType: searchParams.get('admissionType') || '',
    feesMin: searchParams.get('feesMin') || '',
    feesMax: searchParams.get('feesMax') || '',
    minSalary: searchParams.get('minSalary') || '',
    sort: searchParams.get('sort') || 'name',
  });

  const { data, isLoading, error } = useCourses({ page, limit: 12, ...filters });

  useEffect(() => {
    const params = {};
    if (page !== 1) params.page = page;
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  }, [page, filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const { data: courses = [], pagination = {} } = data?.data?.data || {};
  const { total, pages, currentPage = page } = pagination;

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerInner}>
          <p className={styles.bannerEyebrow}>UG · PG · Diploma · Doctorate</p>
          <h1 className={styles.bannerTitle}>Courses <em>in India</em></h1>
          <p className={styles.bannerSubtitle}>Browse 1,200+ programmes across engineering, medical, management, law and more — with fees, careers and eligibility.</p>
        </div>
      </section>

    {error ? (
      <div className={styles.errorWrap}>Error loading courses: {error.message}</div>
    ) : (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <CourseFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Courses in India</h1>
              <p className={styles.subtitle}>
                {total > 0 ? `${total} courses found` : isLoading ? 'Searching...' : 'No courses found'}
              </p>
            </div>
            <div className={styles.sortBar}>
              <label className={styles.sortLabel}>Sort by</label>
              <select
                className={styles.sortSelect}
                value={filters.sort || 'name'}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
              >
                <option value="name">Name (A–Z)</option>
                <option value="fees_asc">Fees: Low to High</option>
                <option value="fees_desc">Fees: High to Low</option>
                <option value="salary">Avg Salary</option>
              </select>
            </div>
          </div>

          {Object.entries(filters).some(([k, v]) => v && k !== 'sort') && (
            <div className={styles.activeFilters}>
              {filters.search && <span className={styles.filterChip}>🔍 "{filters.search}" <button onClick={() => handleFilterChange({ ...filters, search: '' })}>×</button></span>}
              {filters.category && <span className={styles.filterChip}>🎓 {filters.category} <button onClick={() => handleFilterChange({ ...filters, category: '' })}>×</button></span>}
              {filters.discipline && <span className={styles.filterChip}>📚 {filters.discipline} <button onClick={() => handleFilterChange({ ...filters, discipline: '' })}>×</button></span>}
              {filters.mode && <span className={styles.filterChip}>📖 {filters.mode} <button onClick={() => handleFilterChange({ ...filters, mode: '' })}>×</button></span>}
              {filters.admissionType && <span className={styles.filterChip}>✅ {filters.admissionType} <button onClick={() => handleFilterChange({ ...filters, admissionType: '' })}>×</button></span>}
              {filters.minSalary && <span className={styles.filterChip}>💼 Salary {(Number(filters.minSalary)/100000).toFixed(0)}L+ <button onClick={() => handleFilterChange({ ...filters, minSalary: '' })}>×</button></span>}
            </div>
          )}
        </div>

        {courses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3 className={styles.emptyTitle}>No courses found</h3>
            <p className={styles.emptyText}>Try adjusting your filters or search terms.</p>
            <button className={styles.emptyReset} onClick={handleResetFilters}>Clear all filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >‹ Prev</button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                let p;
                if (pages <= 7) {
                  p = i + 1;
                } else if (currentPage <= 4) {
                  p = i < 6 ? i + 1 : pages;
                } else if (currentPage >= pages - 3) {
                  p = i === 0 ? 1 : pages - 6 + i;
                } else {
                  const arr = [1, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, pages];
                  p = arr[i];
                }
                const isEllipsis = i > 0 && p - (pages <= 7 ? i : [1, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, pages][i - 1]) > 1;
                return (
                  <React.Fragment key={i}>
                    {isEllipsis && <span className={styles.ellipsis}>…</span>}
                    <button
                      className={`${styles.pageNum} ${currentPage === p ? styles.pageNumActive : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  </React.Fragment>
                );
              })}
            </div>

            <button
              className={styles.pageBtn}
              disabled={currentPage === pages}
              onClick={() => setPage(currentPage + 1)}
            >Next ›</button>
          </div>
        )}
      </div>
    </div>
    )}
    </div>
  );
};

export default CourseList;
