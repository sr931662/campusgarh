import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCity, FaGraduationCap, FaUniversity, FaCheck } from 'react-icons/fa';
import { useColleges } from '../../hooks/queries';
import CollegeCard from './CollegeCard';
import CollegeFilters from './CollegeFilters';
import Loader from '../common/Loader/Loader';
import styles from './CollegeList.module.css';

const CollegeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    type: searchParams.get('type') || '',
    fundingType: searchParams.get('fundingType') || '',
    ranking: searchParams.get('ranking') || '',
    feesMin: searchParams.get('feesMin') || '',
    feesMax: searchParams.get('feesMax') || '',
    naacGrade: searchParams.get('naacGrade') || '',
    nbaStatus: searchParams.get('nbaStatus') || '',
    approvedBy: searchParams.get('approvedBy') || '',
    campusType: searchParams.get('campusType') || '',
    minPlacement: searchParams.get('minPlacement') || '',
    minPackage: searchParams.get('minPackage') || '',
    admissionMode: searchParams.get('admissionMode') || '',
    isVerified: searchParams.get('isVerified') || '',
    featured: searchParams.get('featured') || '',
    sort: searchParams.get('sort') || 'ranking',
  });

  const { data, isLoading, error } = useColleges({
    page,
    limit: 12,
    ...filters,
  });

  // Update URL when filters or page change
  useEffect(() => {
  const params = {};
  if (page !== 1) params.page = page;
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  setSearchParams(params, { replace: true });
}, [page, filters]);  // remove setSearchParams from deps to avoid loop


  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const { data: colleges = [], pagination = {} } = data?.data?.data || {};
  const { total, pages, currentPage = page, limit } = pagination;

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.pageBanner}>
        <div className={styles.bannerInner}>
          <p className={styles.bannerEyebrow}>Discover &amp; Compare</p>
          <h1 className={styles.bannerTitle}>Colleges <em>in India</em></h1>
          <p className={styles.bannerSubtitle}>Explore 500+ verified institutions — ranked by placement, fees, and real student reviews.</p>
        </div>
      </section>

    {error ? (
      <div className={styles.errorWrap}>Error loading colleges: {error.message}</div>
    ) : (
    <div className={styles.container}>
      {filterOpen && <div className={styles.backdrop} onClick={() => setFilterOpen(false)} />}
      <div className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
        <CollegeFilters
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
              <h1 className={styles.title}>Colleges in India</h1>
              <p className={styles.subtitle}>...</p>
            </div>
            <div className={styles.headerControls}>
              <button className={styles.mobileFilterBtn} onClick={() => setFilterOpen(true)}>
                Filters
                {Object.values(filters).filter(v => v && v !== 'ranking').length > 0 && (
                  <span className={styles.mobileFilterBadge}>{Object.values(filters).filter(v => v && v !== 'ranking').length}</span>
                )}
              </button>
              <div className={styles.sortBar}>
                <span className={styles.sortLabel}>Sort by</span>
                <select className={styles.sortSelect} value={filters.sort || 'ranking'} onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}>
                  <option value="ranking">NIRF Ranking</option>
                  <option value="placement">Placement %</option>
                  <option value="package">Avg Package</option>
                  <option value="fees_asc">Fees: Low to High</option>
                  <option value="fees_desc">Fees: High to Low</option>
                </select>
              </div>
            </div>
          </div>


          {/* Active filter chips */}
          {Object.entries(filters).some(([k, v]) => v && k !== 'sort') && (
            <div className={styles.activeFilters}>
              {filters.search && <span className={styles.filterChip}><FaSearch /> "{filters.search}" <button onClick={() => handleFilterChange({ ...filters, search: '' })}>×</button></span>}
              {filters.state && <span className={styles.filterChip}><FaMapMarkerAlt /> {filters.state} <button onClick={() => handleFilterChange({ ...filters, state: '' })}>×</button></span>}
              {filters.city && <span className={styles.filterChip}><FaCity /> {filters.city} <button onClick={() => handleFilterChange({ ...filters, city: '' })}>×</button></span>}
              {filters.type && <span className={styles.filterChip}><FaGraduationCap /> {filters.type} <button onClick={() => handleFilterChange({ ...filters, type: '' })}>×</button></span>}
              {filters.fundingType && <span className={styles.filterChip}><FaUniversity /> {filters.fundingType} <button onClick={() => handleFilterChange({ ...filters, fundingType: '' })}>×</button></span>}
              {filters.naacGrade && <span className={styles.filterChip}>NAAC {filters.naacGrade} <button onClick={() => handleFilterChange({ ...filters, naacGrade: '' })}>×</button></span>}
              {filters.approvedBy && <span className={styles.filterChip}><FaCheck /> {filters.approvedBy.split(',').join(' + ')} <button onClick={() => handleFilterChange({ ...filters, approvedBy: '' })}>×</button></span>}
              {filters.minPlacement && <span className={styles.filterChip}>Placement {filters.minPlacement}%+ <button onClick={() => handleFilterChange({ ...filters, minPlacement: '' })}>×</button></span>}
              {filters.minPackage && <span className={styles.filterChip}>Pkg {(Number(filters.minPackage)/100000).toFixed(0)}L+ <button onClick={() => handleFilterChange({ ...filters, minPackage: '' })}>×</button></span>}
              {filters.campusType && <span className={styles.filterChip}>{filters.campusType} Campus <button onClick={() => handleFilterChange({ ...filters, campusType: '' })}>×</button></span>}
              {filters.isVerified === 'true' && <span className={styles.filterChip}>✓ Verified <button onClick={() => handleFilterChange({ ...filters, isVerified: '' })}>×</button></span>}
            </div>
          )}
        </div>

        {colleges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FaGraduationCap /></div>
            <h3 className={styles.emptyTitle}>No colleges found</h3>
            <p className={styles.emptyText}>Try adjusting your filters or search terms.</p>
            <button className={styles.emptyReset} onClick={handleResetFilters}>Clear all filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {colleges.map((college) => (
              <CollegeCard key={college._id} college={college} />
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

export default CollegeList;