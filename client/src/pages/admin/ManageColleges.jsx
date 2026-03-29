import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegeService } from '../../services/collegeService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const ManageColleges = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-colleges', page],
    queryFn: () => collegeService.getColleges({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collegeService.deleteCollege(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const raw = data?.data?.data;
  const colleges = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Colleges</h1>
        <Link to="/admin/colleges/create" className={styles.addBtn}>+ Add College</Link>
      </div>

      {error && <div className={styles.error}>Failed to load colleges.</div>}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {colleges.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>No colleges found.</td></tr>
                ) : colleges.map((c) => (
                  <tr key={c._id}>
                    <td><strong>{c.name}</strong>{c.shortName ? ` (${c.shortName})` : ''}</td>
                    <td><span className={styles.badge}>{c.fundingType || '—'}</span></td>
                    <td>{c.contact?.city || '—'}</td>
                    <td>{c.featured ? '✓' : '—'}</td>
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

export default ManageColleges;
