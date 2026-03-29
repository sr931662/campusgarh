import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const ManageCourses = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', page],
    queryFn: () => courseService.getCourses({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => courseService.deleteCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const raw = data?.data?.data;
  const courses = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Courses</h1>
        <Link to="/admin/courses/create" className={styles.addBtn}>+ Add Course</Link>
      </div>

      {error && <div className={styles.error}>Failed to load courses.</div>}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Level</th>
                  <th>Mode</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>No courses found.</td></tr>
                ) : courses.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className={styles.badge}>{c.category || '—'}</span></td>
                    <td>{c.mode || '—'}</td>
                    <td>{c.duration || '—'}</td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(c._id, c.name)}
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

export default ManageCourses;
