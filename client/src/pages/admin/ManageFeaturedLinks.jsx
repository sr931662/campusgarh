import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featuredLinkService } from '../../services/featuredLinkService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';
import formStyles from './AdminForm.module.css';

const EMPTY = { title: '', url: '', openInNewTab: false, order: 0, active: true };

export default function ManageFeaturedLinks() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['featured-links-admin'],
    queryFn: () => featuredLinkService.getAll({ all: 'true' }),
  });
  const links = data?.data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (d) => editing ? featuredLinkService.update(editing._id, d) : featuredLinkService.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['featured-links-admin'] }); qc.invalidateQueries({ queryKey: ['featuredLinks'] }); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => featuredLinkService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['featured-links-admin'] }); qc.invalidateQueries({ queryKey: ['featuredLinks'] }); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => featuredLinkService.update(id, { active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['featured-links-admin'] }); qc.invalidateQueries({ queryKey: ['featuredLinks'] }); },
  });

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (l) => { setEditing(l); setForm({ title: l.title, url: l.url, openInNewTab: l.openInNewTab, order: l.order, active: l.active }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, order: Number(form.order) });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage Featured Links</h1>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Link</button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
        These links appear in the "Featured Links" section of the site footer.
      </p>

      {/* Inline form */}
      {showForm && (
        <div className={formStyles.container} style={{ marginBottom: '2rem' }}>
          <form className={formStyles.form} onSubmit={handleSubmit}>
            <div className={formStyles.sectionTitle}>{editing ? 'Edit' : 'Add'} Featured Link</div>
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <label>Link Title <span>*</span></label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Apply for MBA 2025" />
              </div>
              <div className={formStyles.field}>
                <label>URL <span>*</span></label>
                <input name="url" value={form.url} onChange={handleChange} required placeholder="e.g. /colleges?type=Management or https://..." />
              </div>
            </div>
            <div className={formStyles.row}>
              <div className={formStyles.field}>
                <label>Display Order</label>
                <input name="order" type="number" value={form.order} onChange={handleChange} min="0" />
              </div>
              <div className={formStyles.field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Open in New Tab</label>
                <input type="checkbox" name="openInNewTab" checked={form.openInNewTab} onChange={handleChange} style={{ width: 'auto', marginTop: '0.25rem' }} />
              </div>
              <div className={formStyles.field} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Active</label>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} style={{ width: 'auto', marginTop: '0.25rem' }} />
              </div>
            </div>
            <div className={formStyles.actions}>
              <button type="submit" className={formStyles.submitBtn} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editing ? 'Update Link' : 'Add Link'}
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
                <th>Title</th>
                <th>URL</th>
                <th>Order</th>
                <th>New Tab</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0
                ? <tr><td colSpan={6} className={styles.empty}>No featured links added yet.</td></tr>
                : links.map(l => (
                  <tr key={l._id}>
                    <td><strong>{l.title}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</td>
                    <td>{l.order}</td>
                    <td style={{ color: l.openInNewTab ? '#10b981' : 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                      {l.openInNewTab ? 'Yes' : 'No'}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleMutation.mutate({ id: l._id, active: !l.active })}
                        style={{ background: l.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${l.active ? '#10b981' : 'rgba(255,255,255,0.15)'}`, color: l.active ? '#10b981' : 'rgba(255,255,255,0.4)', borderRadius: 6, padding: '0.25rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        {l.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <button className={styles.editBtn} onClick={() => openEdit(l)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(l._id, l.title)} disabled={deleteMutation.isPending}>Delete</button>
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
