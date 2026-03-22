import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useColleges } from '../../hooks/queries';
import CollegeCard from './CollegeCard';
import CollegeFilters from './CollegeFilters';
import Loader from '../common/Loader/Loader';
import styles from './CollegeList.module.css';

const CollegeList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
      <div className={styles.sidebar}>
        <CollegeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Colleges in India</h1>
              <p className={styles.subtitle}>
                {total > 0 ? `${total} colleges found` : isLoading ? 'Searching...' : 'No colleges found'}
              </p>
            </div>
            <div className={styles.sortBar}>
              <label className={styles.sortLabel}>Sort by</label>
              <select
                className={styles.sortSelect}
                value={filters.sort || 'ranking'}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
              >
                <option value="ranking">NIRF Ranking</option>
                <option value="placement">Placement %</option>
                <option value="package">Avg Package</option>
                <option value="fees_asc">Fees: Low to High</option>
                <option value="fees_desc">Fees: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {Object.entries(filters).some(([k, v]) => v && k !== 'sort') && (
            <div className={styles.activeFilters}>
              {filters.search && <span className={styles.filterChip}>🔍 "{filters.search}" <button onClick={() => handleFilterChange({ ...filters, search: '' })}>×</button></span>}
              {filters.state && <span className={styles.filterChip}>📍 {filters.state} <button onClick={() => handleFilterChange({ ...filters, state: '' })}>×</button></span>}
              {filters.city && <span className={styles.filterChip}>🏙️ {filters.city} <button onClick={() => handleFilterChange({ ...filters, city: '' })}>×</button></span>}
              {filters.type && <span className={styles.filterChip}>🎓 {filters.type} <button onClick={() => handleFilterChange({ ...filters, type: '' })}>×</button></span>}
              {filters.fundingType && <span className={styles.filterChip}>🏦 {filters.fundingType} <button onClick={() => handleFilterChange({ ...filters, fundingType: '' })}>×</button></span>}
              {filters.naacGrade && <span className={styles.filterChip}>NAAC {filters.naacGrade} <button onClick={() => handleFilterChange({ ...filters, naacGrade: '' })}>×</button></span>}
              {filters.approvedBy && <span className={styles.filterChip}>✅ {filters.approvedBy.split(',').join(' + ')} <button onClick={() => handleFilterChange({ ...filters, approvedBy: '' })}>×</button></span>}
              {filters.minPlacement && <span className={styles.filterChip}>Placement {filters.minPlacement}%+ <button onClick={() => handleFilterChange({ ...filters, minPlacement: '' })}>×</button></span>}
              {filters.minPackage && <span className={styles.filterChip}>Pkg {(Number(filters.minPackage)/100000).toFixed(0)}L+ <button onClick={() => handleFilterChange({ ...filters, minPackage: '' })}>×</button></span>}
              {filters.campusType && <span className={styles.filterChip}>{filters.campusType} Campus <button onClick={() => handleFilterChange({ ...filters, campusType: '' })}>×</button></span>}
              {filters.isVerified === 'true' && <span className={styles.filterChip}>✓ Verified <button onClick={() => handleFilterChange({ ...filters, isVerified: '' })}>×</button></span>}
            </div>
          )}
        </div>

        {colleges.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎓</div>
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