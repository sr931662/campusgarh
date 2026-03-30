import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { blogService } from '../../services/blogService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const STATUS_FILTERS = ['all', 'published', 'draft', 'archived'];

const ManageBlogs = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-blogs', page, statusFilter],
    queryFn: () => blogService.getAdminBlogs({
      page,
      limit: 20,
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => blogService.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => blogService.toggleFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['featured-blogs'] });
    },
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFeatured = (id, currentFeatured) => {
    featureMutation.mutate({ id, featured: !currentFeatured });
  };

  const raw = data?.data?.data;
  const blogs = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.pages || pagination.totalPages || 1;
  const featuredCount = blogs.filter(b => b.featured).length;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>

      <div className={styles.header}>
        <div>
          <h1>Manage Blogs</h1>
          {featuredCount > 0 && (
            <p className={styles.headerNote}>
              <FaStar style={{ color: '#f59e0b', marginRight: 4 }} />
              {featuredCount} article{featuredCount !== 1 ? 's' : ''} featured on homepage
            </p>
          )}
        </div>
        <Link to="/admin/blogs/create" className={styles.addBtn}>+ Write Blog</Link>
      </div>

      {/* Status filter tabs */}
      <div className={styles.filterTabs}>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            className={statusFilter === s ? styles.filterTabActive : styles.filterTab}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>Failed to load blogs.</div>}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Homepage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>No blog posts found.</td></tr>
                ) : blogs.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.title}</strong></td>
                    <td><span className={styles.badge}>{b.contentType || '—'}</span></td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{
                          background: b.status === 'published' ? 'rgba(16,185,129,0.15)' :
                                      b.status === 'draft'     ? 'rgba(245,158,11,0.15)' :
                                                                 'rgba(100,116,139,0.15)',
                          color: b.status === 'published' ? '#10b981' :
                                 b.status === 'draft'     ? '#f59e0b' : '#64748b',
                        }}
                      >
                        {b.status || '—'}
                      </span>
                    </td>
                    <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</td>
                    <td>
                      <button
                        className={b.featured ? styles.featuredBtnActive : styles.featuredBtn}
                        onClick={() => handleToggleFeatured(b._id, b.featured)}
                        disabled={featureMutation.isPending || b.status !== 'published'}
                        title={b.status !== 'published' ? 'Publish the blog first to feature it' : b.featured ? 'Remove from homepage' : 'Feature on homepage'}
                      >
                        {b.featured ? <FaStar /> : <FaRegStar />}
                        {b.featured ? ' Featured' : ' Feature'}
                      </button>
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(b._id, b.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageBlogs;
