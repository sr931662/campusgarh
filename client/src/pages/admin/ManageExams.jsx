import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../../services/examService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const ManageExams = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-exams', page],
    queryFn: () => examService.getExams({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => examService.deleteExam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-exams'] }),
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const raw = data?.data?.data;
  const exams = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.totalPages || 1;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Exams</h1>
        <Link to="/admin/exams/create" className={styles.addBtn}>+ Add Exam</Link>
      </div>

      {error && <div className={styles.error}>Failed to load exams.</div>}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Conducting Body</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>No exams found.</td></tr>
                ) : exams.map((e) => (
                  <tr key={e._id}>
                    <td><strong>{e.name}</strong></td>
                    <td><span className={styles.badge}>{e.category || '—'}</span></td>
                    <td>{e.examLevel || '—'}</td>
                    <td>{e.conductingBody || '—'}</td>
                    <td>
                      <div className={styles.actionCell}>
                        <Link to={`/exams/${e.slug}`} className={styles.viewBtn} target="_blank" rel="noopener noreferrer">View</Link>
                        <Link to={`/admin/exams/edit/${e._id}`} className={styles.editBtn}>Edit</Link>
                        <button
                          className={styles.deleteBtn}
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(e._id, e.name)}
                        >
                          Delete
                        </button>
                      </div>
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

export default ManageExams;
