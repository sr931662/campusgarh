import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { collegeService } from '../../services/collegeService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const ManageColleges = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-colleges', page, search],
    queryFn: () => collegeService.getColleges({
      page,
      limit: 20,
      ...(search && { search }),
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => collegeService.deleteCollege(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-colleges'] }),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }) => collegeService.updateCollege(id, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-colleges'] });
      queryClient.invalidateQueries({ queryKey: ['featuredColleges'] });
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFeatured = (id, current) => {
    featureMutation.mutate({ id, featured: !current });
  };

  const raw = data?.data?.data;
  const colleges = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination || {};
  const totalPages = pagination.pages || pagination.totalPages || 1;
  const featuredCount = colleges.filter(c => c.featured).length;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>

      <div className={styles.header}>
        <div>
          <h1>Manage Colleges</h1>
          {featuredCount > 0 && (
            <p className={styles.headerNote}>
              <FaStar style={{ color: '#f59e0b', marginRight: 4 }} />
              {featuredCount} college{featuredCount !== 1 ? 's' : ''} featured on homepage
            </p>
          )}
        </div>
        <Link to="/admin/colleges/create" className={styles.addBtn}>+ Add College</Link>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          type="text"
          placeholder="Search colleges by name…"
          className={styles.searchInput}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
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
                  <th>Verified</th>
                  <th>Homepage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {colleges.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>No colleges found.</td></tr>
                ) : colleges.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <strong>{c.name}</strong>
                      {c.shortName ? <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> ({c.shortName})</span> : ''}
                    </td>
                    <td><span className={styles.badge}>{c.fundingType || '—'}</span></td>
                    <td>{c.contact?.city || '—'}</td>
                    <td>
                      <span style={{ color: c.isVerified ? '#10b981' : 'rgba(255,255,255,0.3)' }}>
                        {c.isVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={c.featured ? styles.featuredBtnActive : styles.featuredBtn}
                        onClick={() => handleToggleFeatured(c._id, c.featured)}
                        disabled={featureMutation.isPending}
                        title={c.featured ? 'Remove from homepage' : 'Show on homepage'}
                      >
                        {c.featured ? <FaStar /> : <FaRegStar />}
                        {c.featured ? ' Featured' : ' Feature'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <Link to={`/colleges/${c.slug}`} className={styles.viewBtn} target="_blank" rel="noopener noreferrer">View</Link>
                        <Link to={`/admin/colleges/edit/${c._id}`} className={styles.editBtn}>Edit</Link>
                        <button
                          className={styles.deleteBtn}
                         disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(c._id, c.name)}
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

export default ManageColleges;
