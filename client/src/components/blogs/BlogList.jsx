import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogs, useBlogCategories } from '../../hooks/queries';
import BlogCard from './BlogCard';
import BlogFilters from './BlogFilters';
import Loader from '../common/Loader/Loader';
import Button from '../common/Button/Button';
import styles from './BlogList.module.css';

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    contentType: searchParams.get('contentType') || '',
  });

  const { data: blogsData, isLoading: blogsLoading, error } = useBlogs({
    page,
    limit: 8,
    sort,
    ...filters,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useBlogCategories();

  useEffect(() => {
    const params = {};
    if (page !== 1) params.page = page;
    if (sort !== 'newest') params.sort = sort;
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  }, [page, sort, filters, setSearchParams]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  if (blogsLoading || categoriesLoading) return <Loader fullScreen />;
  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem' }}>
      <span style={{ fontSize: '2.5rem' }}>📰</span>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1C1E' }}>Could not load articles</h2>
      <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Please check your connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        style={{ padding: '0.6rem 1.4rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '999px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
      >
        Retry
      </button>
    </div>
  );


  const { data: blogs, pagination } = blogsData?.data?.data || { data: [], pagination: {} };
  const categories = categoriesData?.data?.data || [];
  const { pages, currentPage = page } = pagination;

  return (
    <>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Knowledge Hub</p>
        <h1 className={styles.heroTitle}>News &amp; <span>Articles</span></h1>
        <p className={styles.heroSub}>Expert insights, college news, and admission guidance — all in one place.</p>
      </div>

      <div className={styles.container}>
        {filterOpen && <div className={`${styles.backdrop} ${styles.backdropOpen}`} onClick={() => setFilterOpen(false)} />}
        <div className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
          <BlogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
            onClose={() => setFilterOpen(false)}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.mobileFilterBar}>
            <button className={styles.mobileFilterBtn} onClick={() => setFilterOpen(true)}>
              Filters
              {Object.values(filters).some(Boolean) && (
                <span className={styles.mobileFilterBadge}>{Object.values(filters).filter(Boolean).length}</span>
              )}
            </button>
                        <div className={styles.sortBar}>
              <label className={styles.sortLabel}>Content Type</label>
              <select
                className={styles.sortSelect}
                value={filters.contentType || ''}
                onChange={(e) => { handleFilterChange({ ...filters, contentType: e.target.value }); setPage(1); }}
              >
                <option value="">All Types</option>
                <option value="Guide">Guide</option>
                <option value="News">News</option>
                <option value="Ranking">Ranking</option>
                <option value="College Review">College Review</option>
                <option value="Exam Update">Exam Update</option>
                <option value="Career Advice">Career Advice</option>
                <option value="Scholarship">Scholarship</option>
              </select>
            </div>

          </div>


          <div className={styles.grid}>
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>

          {pages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pages}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogList;
