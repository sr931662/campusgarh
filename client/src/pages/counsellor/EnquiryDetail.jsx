import { useState } from 'react';
import { FaInbox } from 'react-icons/fa';
import { useParams, Link } from 'react-router-dom';
import {
  useEnquiry,
  useAddNote,
  useUpdateCallStatus,
  useUpdateConversionStatus,
} from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import Button from '../../components/common/Button/Button';
import styles from './EnquiryDetail.module.css';

const CALL_STATUSES = ['pending', 'connected', 'not_reachable', 'follow_up'];
const CONVERSION_STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'converted', 'lost'];

const statusLabel = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const CONVERSION_COLORS = {
  new: '#64748b',
  contacted: '#3b82f6',
  interested: '#10b981',
  not_interested: '#ef4444',
  converted: '#22c55e',
  lost: '#94a3b8',
};

const CALL_COLORS = {
  pending: '#f59e0b',
  connected: '#10b981',
  not_reachable: '#ef4444',
  follow_up: '#8b5cf6',
};

export default function EnquiryDetail() {
  const { id } = useParams();
  const { data: res, isLoading, error } = useEnquiry(id);
  const addNoteMutation = useAddNote();
  const updateCallMutation = useUpdateCallStatus();
  const updateConversionMutation = useUpdateConversionStatus();

  const [note, setNote] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [conversionStatus, setConversionStatus] = useState('');

  const enq = res?.data?.data;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await addNoteMutation.mutateAsync({ enquiryId: id, note });
    setNote('');
  };

  const handleUpdateCall = async (e) => {
    e.preventDefault();
    if (!callStatus) return;
    await updateCallMutation.mutateAsync({ enquiryId: id, callStatus, followUpDate: followUpDate || undefined });
  };

  const handleUpdateConversion = async (e) => {
    e.preventDefault();
    if (!conversionStatus) return;
    await updateConversionMutation.mutateAsync({ enquiryId: id, conversionStatus });
  };

  if (isLoading) return (
    <div className={styles.loadingWrap}>
      <Loader size="lg" />
      <p>Loading enquiry…</p>
    </div>
  );

  if (error || !enq) return (
    <div className={styles.errorWrap}>
      <span className={styles.errorIcon}><FaInbox /></span>
      <h2>Enquiry not found</h2>
      <Link to="/dashboard/counsellor"><Button variant="primary">Back to Dashboard</Button></Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/dashboard/counsellor" className={styles.back}>← Back to Dashboard</Link>
      </div>

      <div className={styles.grid}>
        {/* ── LEFT: Details ─────────────────────────────── */}
        <div className={styles.left}>
          {/* Student info */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Student Details</h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.infoValue}>{enq.studentName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{enq.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{enq.phone}</span>
              </div>
              {enq.preferredCity && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Preferred City</span>
                  <span className={styles.infoValue}>{enq.preferredCity}</span>
                </div>
              )}
              {enq.courseInterest?.name && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Course Interest</span>
                  <span className={styles.infoValue}>{enq.courseInterest.name}</span>
                </div>
              )}
              {enq.collegeInterest?.name && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>College Interest</span>
                  <span className={styles.infoValue}>{enq.collegeInterest.name}</span>
                </div>
              )}
            </div>
            {enq.message && (
              <div className={styles.messageBox}>
                <span className={styles.infoLabel}>Message</span>
                <p className={styles.messageText}>{enq.message}</p>
              </div>
            )}
          </div>

          {/* Current status */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Current Status</h2>
            <div className={styles.statusRow}>
              <div className={styles.statusItem}>
                <span className={styles.infoLabel}>Call Status</span>
                <span
                  className={styles.statusBadge}
                  style={{ background: CALL_COLORS[enq.callStatus] || '#64748b' }}
                >
                  {statusLabel(enq.callStatus || 'pending')}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.infoLabel}>Conversion</span>
                <span
                  className={styles.statusBadge}
                  style={{ background: CONVERSION_COLORS[enq.conversionStatus] || '#64748b' }}
                >
                  {statusLabel(enq.conversionStatus || 'new')}
                </span>
              </div>
              {enq.followUpDate && (
                <div className={styles.statusItem}>
                  <span className={styles.infoLabel}>Follow-up Date</span>
                  <span className={styles.infoValue}>
                    {new Date(enq.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes history */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Notes</h2>
            {enq.notes?.length > 0 ? (
              <div className={styles.notesList}>
                {enq.notes.map((n, i) => (
                  <div key={i} className={styles.noteItem}>
                    <p className={styles.noteText}>{n.note || n.text || n}</p>
                    {n.createdAt && (
                      <span className={styles.noteDate}>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>No notes yet.</p>
            )}

            <form onSubmit={handleAddNote} className={styles.noteForm}>
              <textarea
                className={styles.noteInput}
                rows={3}
                placeholder="Add a note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!note.trim() || addNoteMutation.isPending}
              >
                {addNoteMutation.isPending ? 'Saving…' : 'Add Note'}
              </Button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Actions ────────────────────────────── */}
        <div className={styles.right}>
          {/* Update call status */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Update Call Status</h2>
            <form onSubmit={handleUpdateCall} className={styles.actionForm}>
              <select
                className={styles.select}
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
              >
                <option value="">— Select status —</option>
                {CALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
              <div className={styles.formGroup}>
                <label className={styles.label}>Follow-up Date (optional)</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!callStatus || updateCallMutation.isPending}
              >
                {updateCallMutation.isPending ? 'Updating…' : 'Update Call Status'}
              </Button>
            </form>
          </div>

          {/* Update conversion status */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Update Conversion</h2>
            <form onSubmit={handleUpdateConversion} className={styles.actionForm}>
              <select
                className={styles.select}
                value={conversionStatus}
                onChange={(e) => setConversionStatus(e.target.value)}
              >
                <option value="">— Select status —</option>
                {CONVERSION_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!conversionStatus || updateConversionMutation.isPending}
              >
                {updateConversionMutation.isPending ? 'Updating…' : 'Update Conversion'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
