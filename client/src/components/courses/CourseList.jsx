import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaGraduationCap, FaBook, FaBookOpen, FaCheck, FaBriefcase } from 'react-icons/fa';
import { useCourses } from '../../hooks/queries';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import Loader from '../common/Loader/Loader';
import styles from './CourseList.module.css';

const CourseList = ({ defaultCategory = '', pageTitle = 'Courses in India', pageH1 = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [sort, setSort] = useState(searchParams.get('sort') || 'name');
  const [filters, setFilters] = useState({
    search:        searchParams.get('search')        || '',
    category: searchParams.get('category') || defaultCategory,
    mode:          searchParams.get('mode')          || '',
    discipline:    searchParams.get('discipline')    || '',
    admissionType: searchParams.get('admissionType') || '',
    feesMin:       searchParams.get('feesMin')       || '',
    feesMax:       searchParams.get('feesMax')       || '',
    minSalary:     searchParams.get('minSalary')     || '',
  });

  const { data, isLoading, error } = useCourses({ page, limit: 12, sort, ...filters });

  useEffect(() => {
    const params = {};
    if (page !== 1) params.page = page;
    if (sort !== 'name') params.sort = sort;
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  }, [page, sort, filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', category: '', mode: '', discipline: '', admissionType: '', feesMin: '', feesMax: '', minSalary: '' });
    setSort('name');
    setPage(1);
  };

  const raw = data?.data?.data;
  const courses   = Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const { total, pages } = pagination;
  const currentPage = pagination.page || page;

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
          {/* {filterOpen && <div className={styles.backdrop} onClick={() => setFilterOpen(false)} />} */}
          {filterOpen && <div className={`${styles.backdrop} ${styles.backdropOpen}`} onClick={() => setFilterOpen(false)} />}

          <div className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
            <CourseFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onClose={() => setFilterOpen(false)}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <div>
                  <h2 className={styles.title}>Courses in India</h2>
                  <p className={styles.subtitle}>
                    {isLoading ? 'Searching…' : total > 0 ? `${total} courses found` : 'No courses found'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className={styles.mobileFilterBtn} onClick={() => setFilterOpen(true)}>
                    Filters
                    {Object.values(filters).some(Boolean) && (
                      <span className={styles.mobileFilterBadge}>{Object.values(filters).filter(Boolean).length}</span>
                    )}
                  </button>
                  <div className={styles.sortBar}>
                    <label className={styles.sortLabel}>Sort by</label>
                    <select
                      className={styles.sortSelect}
                      value={sort}
                      onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    >
                      <option value="name">Name (A–Z)</option>
                      <option value="fees_asc">Fees: Low to High</option>
                      <option value="fees_desc">Fees: High to Low</option>
                      <option value="salary">Avg Salary</option>
                    </select>
                  </div>
                </div>
              </div>

              {Object.values(filters).some(Boolean) && (
                <div className={styles.activeFilters}>
                  {filters.search        && <span className={styles.filterChip}><FaSearch /> "{filters.search}" <button onClick={() => handleFilterChange({ ...filters, search: '' })}>×</button></span>}
                  {filters.category      && <span className={styles.filterChip}><FaGraduationCap /> {filters.category} <button onClick={() => handleFilterChange({ ...filters, category: '' })}>×</button></span>}
                  {filters.discipline    && <span className={styles.filterChip}><FaBook /> {filters.discipline} <button onClick={() => handleFilterChange({ ...filters, discipline: '' })}>×</button></span>}
                  {filters.mode         && <span className={styles.filterChip}><FaBookOpen /> {filters.mode} <button onClick={() => handleFilterChange({ ...filters, mode: '' })}>×</button></span>}
                  {filters.admissionType && <span className={styles.filterChip}><FaCheck /> {filters.admissionType} <button onClick={() => handleFilterChange({ ...filters, admissionType: '' })}>×</button></span>}
                  {filters.minSalary     && <span className={styles.filterChip}><FaBriefcase /> Salary {(Number(filters.minSalary)/100000).toFixed(0)}L+ <button onClick={() => handleFilterChange({ ...filters, minSalary: '' })}>×</button></span>}
                </div>
              )}
            </div>

            {isLoading ? (
              <Loader />
            ) : courses.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><FaBook /></div>
                <h3 className={styles.emptyTitle}>No courses found</h3>
                <p className={styles.emptyText}>Try adjusting your filters or search terms.</p>
                <button className={styles.emptyReset} onClick={handleResetFilters}>Clear all filters</button>
              </div>
            ) : (
              <div className={styles.grid}>
                {courses.map((course) => <CourseCard key={course._id} course={course} />)}
              </div>
            )}

            {!isLoading && pages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Prev</button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                    let p;
                    if (pages <= 7)              p = i + 1;
                    else if (currentPage <= 4)   p = i < 6 ? i + 1 : pages;
                    else if (currentPage >= pages - 3) p = i === 0 ? 1 : pages - 6 + i;
                    else {
                      const arr = [1, currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2, pages];
                      p = arr[i];
                    }
                    const prev = pages <= 7 ? i : [1, currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2, pages][i-1];
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && p - prev > 1 && <span className={styles.ellipsis}>…</span>}
                        <button
                          className={`${styles.pageNum} ${currentPage === p ? styles.pageNumActive : ''}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                      </React.Fragment>
                    );
                  })}
                </div>
                <button className={styles.pageBtn} disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next ›</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;
