import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accreditationService } from '../../services/accreditationService';
import { mediaService } from '../../services/mediaService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';
import formStyles from './AdminForm.module.css';

const EMPTY = { abbr: '', full: '', logoUrl: '', order: 0, active: true };

export default function ManageAccreditation() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = add new
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['accreditation-admin'],
    queryFn: () => accreditationService.getAll({ all: 'true' }),
  });
  const bodies = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? accreditationService.update(editing._id, d) : accreditationService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accreditation-admin'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => accreditationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accreditation-admin'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => accreditationService.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accreditation-admin'] }),
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (b) => { setEditing(b); setForm({ abbr: b.abbr, full: b.full, logoUrl: b.logoUrl, order: b.order, active: b.active }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'image');
      const res = await mediaService.uploadFile(fd);
      const url = res?.data?.data?.url || res?.data?.url || '';
      setForm(p => ({ ...p, logoUrl: url }));
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, order: Number(form.order) });
  };

  const handleDelete = (id, abbr) => {
    if (window.confirm(`Delete "${abbr}"?`)) deleteMutation.mutate(id);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Accreditation Bodies</h1>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Body</button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className={formStyles.container} style={{ marginBottom: '2rem' }}>
          <form className={formStyles.form} onSubmit={handleSubmit}>
            <div className={formStyles.sectionTitle}>{editing ? 'Edit' : 'Add'} Accreditation Body</div>
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <label>Abbreviation <span>*</span></label>
                <input name="abbr" value={form.abbr} onChange={handleChange} required placeholder="e.g. NAAC" />
              </div>
              <div className={formStyles.field}>
                <label>Full Name <span>*</span></label>
                <input name="full" value={form.full} onChange={handleChange} required placeholder="e.g. National Assessment and Accreditation Council" />
              </div>
            </div>
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <label>Display Order</label>
                <input name="order" type="number" value={form.order} onChange={handleChange} min="0" />
              </div>
              <div className={formStyles.field}>
                <label>Active</label>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} style={{ width: 'auto', marginTop: '0.5rem' }} />
              </div>
            </div>
            <div className={formStyles.field}>
              <label>Logo</label>
              {form.logoUrl && (
                <img src={form.logoUrl} alt="logo preview" style={{ height: 48, marginBottom: '0.5rem', objectFit: 'contain', background: '#fff', borderRadius: 6, padding: 4 }} />
              )}
              <input type="file" accept="image/*" ref={fileRef} onChange={handleLogoUpload} style={{ color: 'rgba(255,255,255,0.6)' }} />
              {uploading && <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>Uploading...</span>}
            </div>
            <div className={formStyles.actions}>
              <button type="submit" className={formStyles.submitBtn} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : (editing ? 'Update' : 'Add Body')}
              </button>
              <button type="button" className={formStyles.cancelLink} onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <Loader /> : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Logo</th>
                <th>Abbr</th>
                <th>Full Name</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bodies.length === 0
                ? <tr><td colSpan={6} className={styles.empty}>No bodies added yet.</td></tr>
                : bodies.map(b => (
                  <tr key={b._id}>
                    <td>
                      {b.logoUrl
                        ? <img src={b.logoUrl} alt={b.abbr} style={{ height: 36, maxWidth: 70, objectFit: 'contain', background: '#fff', borderRadius: 4, padding: 2 }} />
                        : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>No logo</span>}
                    </td>
                    <td><strong>{b.abbr}</strong></td>
                    <td style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{b.full}</td>
                    <td>{b.order}</td>
                    <td>
                      <button
                        onClick={() => toggleMutation.mutate({ id: b._id, active: !b.active })}
                        style={{ background: b.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${b.active ? '#10b981' : 'rgba(255,255,255,0.15)'}`, color: b.active ? '#10b981' : 'rgba(255,255,255,0.4)', borderRadius: 6, padding: '0.25rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {b.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.editBtn} onClick={() => openEdit(b)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(b._id, b.abbr)} disabled={deleteMutation.isPending}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
