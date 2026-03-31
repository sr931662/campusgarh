import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { usePartnerLeads } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './PartnerLeads.module.css';

const CONVERSION_COLORS = {
  new: '#64748b', contacted: '#3b82f6', interested: '#10b981',
  not_interested: '#ef4444', converted: '#22c55e', lost: '#94a3b8',
};
const statusLabel = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const CONVERSION_STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost'];

export default function PartnerLeads() {
  const [page, setPage] = useState(1);
  const [conversionFilter, setConversionFilter] = useState('');

  const params = {
    page,
    limit: 20,
    ...(conversionFilter && { conversionStatus: conversionFilter }),
  };

  const { data: res, isLoading } = usePartnerLeads(params);

  const _raw       = res?.data?.data;
  const leads      = Array.isArray(_raw) ? _raw : Array.isArray(_raw?.data) ? _raw.data : [];
  const total      = _raw?.pagination?.total || _raw?.total || leads.length;
  const totalPages = _raw?.pagination?.pages || Math.ceil(total / 20) || 1;

  return (
    <div className={styles.page}>
      <Link to="/partner/dashboard" className={styles.back}><FaArrowLeft /> Dashboard</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Submitted Leads</h1>
          <p className={styles.subtitle}>{total} total leads</p>
        </div>
        <Link to="/partner/import" className={styles.importBtn}>+ Import More Leads</Link>
      </div>

      {/* Filter */}
      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={conversionFilter}
          onChange={e => { setConversionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {CONVERSION_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        {conversionFilter && (
          <button className={styles.clearBtn} onClick={() => { setConversionFilter(''); setPage(1); }}>
            Clear
          </button>
        )}
      </div>

      {isLoading ? <Loader /> : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={8} className={styles.empty}>No leads found.</td></tr>
                ) : leads.map((lead, i) => (
                  <tr key={lead._id}>
                    <td className={styles.idx}>{(page - 1) * 20 + i + 1}</td>
                    <td className={styles.name}>{lead.studentName}</td>
                    <td>{lead.phone}</td>
                    <td className={styles.email}>{lead.email || '—'}</td>
                    <td>{lead.preferredCity || '—'}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: CONVERSION_COLORS[lead.conversionStatus] || '#64748b' }}
                      >
                        {statusLabel(lead.conversionStatus || 'new')}
                      </span>
                    </td>
                    <td>{lead.assignedTo?.name || <span className={styles.muted}>Pending assignment</span>}</td>
                    <td className={styles.date}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
              <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
