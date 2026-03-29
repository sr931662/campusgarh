import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt, FaChartBar } from 'react-icons/fa';
import { useAllEnquiries } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminLeads.module.css';

const CONVERSION_COLORS = {
  new: '#64748b', contacted: '#3b82f6', interested: '#10b981',
  not_interested: '#ef4444', converted: '#22c55e', lost: '#94a3b8',
};
const CALL_COLORS = {
  pending: '#f59e0b', connected: '#10b981', not_reachable: '#ef4444', follow_up: '#8b5cf6',
};
const statusLabel = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const CONVERSION_STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost'];
const CALL_STATUSES = ['pending', 'connected', 'not_reachable', 'follow_up'];

export default function AdminLeads() {
  const [page, setPage] = useState(1);
  const [conversionFilter, setConversionFilter] = useState('');
  const [callFilter, setCallFilter] = useState('');

  const params = {
    page,
    limit: 20,
    ...(conversionFilter && { conversionStatus: conversionFilter }),
    ...(callFilter       && { callStatus: callFilter }),
  };

  const { data: res, isLoading } = useAllEnquiries(params);
  const _raw       = res?.data?.data;
    const enquiries  = Array.isArray(_raw) ? _raw : Array.isArray(_raw?.data) ? _raw.data : [];
    const total      = _raw?.pagination?.total || _raw?.total || enquiries.length;
    const totalPages = _raw?.pagination?.pages || Math.ceil(total / 20) || 1;



  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Leads Management</h1>
          <p className={styles.subtitle}>{total} total enquiries</p>
        </div>
        <Link to="/admin/analytics" className={styles.analyticsBtn}>
          <FaChartBar /> Analytics
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <select className={styles.filterSelect} value={conversionFilter} onChange={handleFilterChange(setConversionFilter)}>
          <option value="">All Conversion Status</option>
          {CONVERSION_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select className={styles.filterSelect} value={callFilter} onChange={handleFilterChange(setCallFilter)}>
          <option value="">All Call Status</option>
          {CALL_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        {(conversionFilter || callFilter) && (
          <button className={styles.clearBtn} onClick={() => { setConversionFilter(''); setCallFilter(''); setPage(1); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>College Interest</th>
                  <th>Assigned To</th>
                  <th>Conversion</th>
                  <th>Call</th>
                  <th>Follow-up</th>
                  <th>Received</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 ? (
                  <tr><td colSpan={10} className={styles.emptyRow}>No enquiries match the filters.</td></tr>
                ) : enquiries.map((enq, i) => (
                  <tr key={enq._id}>
                    <td className={styles.tdIdx}>{(page - 1) * 20 + i + 1}</td>
                    <td>
                      <span className={styles.studentName}>{enq.studentName}</span>
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <span>{enq.phone}</span>
                        <span className={styles.emailText}>{enq.email}</span>
                      </div>
                    </td>
                    <td>{enq.collegeInterest?.name || <span className={styles.na}>—</span>}</td>
                    <td>
                      {enq.assignedTo?.name
                        ? <span className={styles.assignedName}>{enq.assignedTo.name}</span>
                        : <span className={styles.unassigned}>Unassigned</span>}
                    </td>
                    <td>
                      <span className={styles.badge} style={{ background: CONVERSION_COLORS[enq.conversionStatus] || '#64748b' }}>
                        {statusLabel(enq.conversionStatus || 'new')}
                      </span>
                    </td>
                    <td>
                      <span className={styles.badge} style={{ background: CALL_COLORS[enq.callStatus] || '#f59e0b' }}>
                        {statusLabel(enq.callStatus || 'pending')}
                      </span>
                    </td>
                    <td className={styles.tdDate}>
                      {enq.followUpDate
                        ? new Date(enq.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : <span className={styles.na}>—</span>}
                    </td>
                    <td className={styles.tdDate}>
                      {new Date(enq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <Link to={`/enquiries/${enq._id}`} className={styles.viewBtn}>
                        View <FaExternalLinkAlt />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
