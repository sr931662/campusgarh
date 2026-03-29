import React, { useState } from 'react';
import { useAllRoleRequests, useReviewRoleRequest } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminRoleRequests.module.css';

const ROLE_LABELS = { student: 'Student', counsellor: 'Counsellor', institution_rep: 'Institution Rep' };

const AdminRoleRequests = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const { data: res, isLoading } = useAllRoleRequests({ status: statusFilter });
  const reviewMutation = useReviewRoleRequest();

  const requests = res?.data?.data?.data || res?.data?.data || [];

  const handle = (id, action) => {
    const note = action === 'reject' ? window.prompt('Rejection reason (optional):') : '';
    if (action === 'reject' && note === null) return; // cancelled prompt
    reviewMutation.mutate({ id, action, reviewNote: note || '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Role Change Requests</h1>
        <div className={styles.filters}>
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <Loader /> : requests.length === 0 ? (
        <p className={styles.empty}>No {statusFilter} requests.</p>
      ) : (
        <div className={styles.list}>
          {requests.map(r => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.userName}>{r.user?.name}</div>
                  <div className={styles.userEmail}>{r.user?.email}</div>
                </div>
                <span className={`${styles.status} ${styles[r.status]}`}>{r.status}</span>
              </div>
              <div className={styles.roleChange}>
                <span className={styles.from}>{ROLE_LABELS[r.currentRole]   || r.currentRole}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.to}>{ROLE_LABELS[r.requestedRole] || r.requestedRole}</span>
              </div>
              <div className={styles.reason}>{r.reason}</div>
              {r.reviewNote && <div className={styles.reviewNote}>Note: {r.reviewNote}</div>}
              <div className={styles.meta}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              {r.status === 'pending' && (
                <div className={styles.actions}>
                  <button className={styles.approveBtn} onClick={() => handle(r._id, 'approve')} disabled={reviewMutation.isPending}>Approve</button>
                  <button className={styles.rejectBtn}  onClick={() => handle(r._id, 'reject')}  disabled={reviewMutation.isPending}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRoleRequests;
