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
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    contentType: searchParams.get('contentType') || '',
  });

  const { data: blogsData, isLoading: blogsLoading, error } = useBlogs({
    page,
    limit: 8,
    ...filters,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useBlogCategories();

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

  if (blogsLoading || categoriesLoading) return <Loader fullScreen />;
  if (error) return <div className={styles.error}>Error loading blogs</div>;

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
        <div className={styles.sidebar}>
          <BlogFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            categories={categories}
          />
        </div>

        <div className={styles.content}>
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
