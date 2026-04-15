import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import styles from './AdminForm.module.css';

const EMPTY = { name: '', role: '', exp: '', desc: '', imgUrl: '', linkedin: '', twitter: '', instagram: '', order: 0, isActive: true };

export default function ManageCounselors() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);   // null = add new, object = edit existing
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['counselors-admin'],
    queryFn: () => api.get('/counselors/admin/all'),
  });
  const list = data?.data?.data || [];

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveMutation = useMutation({
    mutationFn: (d) => editing?._id ? api.patch(`/counselors/${editing._id}`, d) : api.post('/counselors', d),
    onSuccess: () => { qc.invalidateQueries(['counselors-admin']); qc.invalidateQueries(['counselors-public']); setShowForm(false); setEditing(null); setForm(EMPTY); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/counselors/${id}`),
    onSuccess: () => { qc.invalidateQueries(['counselors-admin']); qc.invalidateQueries(['counselors-public']); },
  });

  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, role: c.role, exp: c.exp, desc: c.desc, imgUrl: c.imgUrl || '', linkedin: c.linkedin || '', twitter: c.twitter || '', instagram: c.instagram || '', order: c.order ?? 0, isActive: c.isActive ?? true }); setShowForm(true); };
  const openAdd  = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Counselors</h1>
        <p>Add, edit, or remove counselors shown on the homepage</p>
      </div>

      <button onClick={openAdd} style={{ marginBottom: '1.5rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
        + Add Counselor
      </button>

      {/* List */}
      {isLoading ? <p style={{ color: '#6b7280' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {list.map(c => (
            <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#FFFEF9', border: '1.5px solid #E8E3DB', borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F5E9C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#C9A84C', flexShrink: 0 }}>
                {c.imgUrl ? <img src={c.imgUrl} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : c.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{c.role} · {c.exp}</div>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 999, background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.isActive ? '#059669' : '#ef4444', fontWeight: 600 }}>
                {c.isActive ? 'Active' : 'Hidden'}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEdit(c)} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 6, padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Edit</button>
                <button onClick={() => { if (window.confirm(`Delete ${c.name}?`)) deleteMutation.mutate(c._id); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 6, padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.78rem' }}>Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No counselors yet. Add one above.</p>}
        </div>
      )}

      {/* Form panel */}
      {showForm && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{editing ? 'Edit Counselor' : 'Add Counselor'}</div>
          <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(form); }} className={styles.form} style={{ marginTop: '1rem' }}>
            <div className={styles.row}>
              <div className={styles.field}><label>Full Name *</label><input name="name" value={form.name} onChange={set} required placeholder="Priya Sharma" /></div>
              <div className={styles.field}><label>Role / Specialization *</label><input name="role" value={form.role} onChange={set} required placeholder="Engineering & MBA Specialist" /></div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}><label>Experience</label><input name="exp" value={form.exp} onChange={set} placeholder="7 yrs" /></div>
              <div className={styles.field}><label>Display Order (lower = first)</label><input name="order" type="number" value={form.order} onChange={set} placeholder="0" /></div>
            </div>
            <div className={styles.field}><label>Short Bio / Description</label><textarea name="desc" value={form.desc} onChange={set} rows={3} placeholder="Guided 500+ students into top IITs..." /></div>
            <div className={styles.field}><label>Photo URL (optional)</label><input name="imgUrl" value={form.imgUrl} onChange={set} placeholder="https://..." /></div>
            <div className={styles.row3}>
              <div className={styles.field}><label>LinkedIn URL</label><input name="linkedin" value={form.linkedin} onChange={set} placeholder="https://linkedin.com/in/..." /></div>
              <div className={styles.field}><label>Twitter / X URL</label><input name="twitter" value={form.twitter} onChange={set} placeholder="https://x.com/..." /></div>
              <div className={styles.field}><label>Instagram URL</label><input name="instagram" value={form.instagram} onChange={set} placeholder="https://instagram.com/..." /></div>
            </div>
            <div className={styles.checkboxField}>
              <input type="checkbox" id="isActive" name="isActive" checked={form.isActive} onChange={set} />
              <label htmlFor="isActive">Show on homepage (active)</label>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn} disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving…' : editing ? 'Update Counselor' : 'Add Counselor'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className={styles.cancelLink} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
