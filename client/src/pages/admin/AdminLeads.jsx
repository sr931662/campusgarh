import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllEnquiries, useAssignEnquiry, useCounsellors } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminLeads.module.css';
import { FaExternalLinkAlt, FaChartBar, FaWhatsapp } from 'react-icons/fa';
import { enquiryService } from '../../services/enquiryService';
import { useDeleteEnquiry } from '../../hooks/queries';


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
  // Track which row has the assign dropdown open and its selected counsellor
  const [assigningId, setAssigningId] = useState(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  // Add these states at the top of the component:
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const { mutate: deleteEnquiry } = useDeleteEnquiry();
  
  // Update params object to include:
  const params = {
    page,
    limit: 20,
    ...(conversionFilter && { conversionStatus: conversionFilter }),
    ...(callFilter       && { callStatus: callFilter }),
    ...(sourceFilter     && { source: sourceFilter }),
    ...(search           && { search }),
  };


  const { data: res, isLoading }   = useAllEnquiries(params);
  const { data: cRes }             = useCounsellors();
  const { mutate: assignEnquiry, isPending: assigning } = useAssignEnquiry();

  const _raw       = res?.data?.data;
  const enquiries  = Array.isArray(_raw) ? _raw : Array.isArray(_raw?.data) ? _raw.data : [];
  const total      = _raw?.pagination?.total || _raw?.total || enquiries.length;
  const totalPages = _raw?.pagination?.pages || Math.ceil(total / 20) || 1;

  

  const counsellors = cRes?.data?.data ?? [];

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleAssign = (enquiryId) => {
    if (!selectedCounsellor) return;
    assignEnquiry({ enquiryId, counsellorId: selectedCounsellor }, {
      onSuccess: () => { setAssigningId(null); setSelectedCounsellor(''); },
    });
  };

  const handleExport = () => {
    const qp = new URLSearchParams();
    if (conversionFilter) qp.set('conversionStatus', conversionFilter);
    if (callFilter)       qp.set('callStatus', callFilter);
    if (sourceFilter)     qp.set('source', sourceFilter);
    if (search)           qp.set('search', search);
    window.open(`${import.meta.env.VITE_API_URL}/api/v1/enquiries/export/csv?${qp}`, '_blank');
  };

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
        <button onClick={handleExport} className={styles.analyticsBtn}>
          ↓ Export CSV
        </button>

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
        {(conversionFilter || callFilter || sourceFilter || search) && (
          <button className={styles.clearBtn} onClick={() => {
            setConversionFilter(''); setCallFilter('');
            setSourceFilter(''); setSearch(''); setPage(1);
          }}>
            Clear filters
          </button>
        )}

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search name, phone, email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select className={styles.filterSelect} value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}>
          <option value="">All Sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social</option>
          <option value="ads">Ads</option>
          <option value="other">Other</option>
        </select>

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
                      {enq.importedBy && (
                        <span className={styles.partnerTag} title="Partner lead">P</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <span>{enq.phone}</span>
                        {enq.phone && (
                          <a
                            href={`https://wa.me/91${enq.phone.replace(/\D/g,'').replace(/^91/, '')}?text=...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.waBtn}
                            title="Open WhatsApp"
                          >
                            <FaWhatsapp />
                          </a>
                        )}
                        <span className={styles.emailText}>{enq.email}</span>
                      </div>
                    </td>
                    <td>{enq.collegeInterest?.name || <span className={styles.na}>—</span>}</td>

                    {/* Assign cell */}
                    <td>
                      {assigningId === enq._id ? (
                        <div className={styles.assignInline}>
                          <select
                            className={styles.assignSelect}
                            value={selectedCounsellor}
                            onChange={e => setSelectedCounsellor(e.target.value)}
                          >
                            <option value="">Pick counsellor</option>
                            {counsellors.map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                          <button
                            className={styles.assignConfirmBtn}
                            onClick={() => handleAssign(enq._id)}
                            disabled={!selectedCounsellor || assigning}
                          >
                            ✓
                          </button>
                          <button
                            className={styles.assignCancelBtn}
                            onClick={() => { setAssigningId(null); setSelectedCounsellor(''); }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className={styles.assignCell}>
                          {enq.assignedTo?.name
                            ? <span className={styles.assignedName}>{enq.assignedTo.name}</span>
                            : <span className={styles.unassigned}>Unassigned</span>}
                          <button
                            className={styles.assignBtn}
                            onClick={() => { setAssigningId(enq._id); setSelectedCounsellor(''); }}
                            title="Assign / Reassign"
                          >
                            {enq.assignedTo ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      )}
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
                    <td>
                      <button
                        className={styles.deleteRowBtn}
                        onClick={() => { if (window.confirm('Delete this lead?')) deleteEnquiry(enq._id); }}
                        title="Delete lead"
                      >
                        ✕
                      </button>
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
