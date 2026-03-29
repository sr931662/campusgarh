import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '../../services/blogService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const ManageBlogs = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-blogs', page],
    queryFn: () => blogService.getBlogs({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => blogService.deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }),
  });

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const raw = data?.data?.data;
  const blogs = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Blogs</h1>
        <Link to="/admin/blogs/create" className={styles.addBtn}>+ Write Blog</Link>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>No blog posts found.</td></tr>
                ) : blogs.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.title}</strong></td>
                    <td><span className={styles.badge}>{b.contentType || '—'}</span></td>
                    <td><span className={styles.badge}>{b.status || '—'}</span></td>
                    <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}</td>
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
