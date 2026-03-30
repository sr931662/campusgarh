import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoTestimonialService } from '../../services/videoTestimonialService';
import Loader from '../../components/common/Loader/Loader';
import styles from './ManageList.module.css';

const empty = { title: '', description: '', thumbnailUrl: '', videoUrl: '', views: '', order: 0, isActive: true };

export default function AdminVideoTestimonials() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['video-testimonials'],
    queryFn: () => videoTestimonialService.getAll().then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['video-testimonials'] });

  const createMut = useMutation({
    mutationFn: videoTestimonialService.create,
    onSuccess: () => { invalidate(); setForm(empty); setShowForm(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => videoTestimonialService.update(id, data),
    onSuccess: () => { invalidate(); setForm(empty); setEditId(null); setShowForm(false); },
  });

  const deleteMut = useMutation({
    mutationFn: videoTestimonialService.delete,
    onSuccess: invalidate,
  });

  const submit = (e) => {
    e.preventDefault();
    if (editId) updateMut.mutate({ id: editId, data: form });
    else createMut.mutate(form);
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setForm({
      title: item.title,
      description: item.description || '',
      thumbnailUrl: item.thumbnailUrl,
      videoUrl: item.videoUrl,
      views: item.views,
      order: item.order,
      isActive: item.isActive,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(empty);
    setShowForm(false);
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const items = data || [];

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>

      <div className={styles.header}>
        <div>
          <h1>Video Testimonials</h1>
          {items.length > 0 && (
            <p className={styles.headerNote}>{items.length} video{items.length !== 1 ? 's' : ''} added</p>
          )}
        </div>
        {!showForm && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>+ Add Video</button>
        )}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-soft, #F7F4EF)',
          border: '1px solid var(--border, #E8E3DB)',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: 'var(--charcoal, #1C1C1E)' }}>
            {editId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input
              placeholder="Title *"
              required
              {...field('title')}
              style={inputStyle}
            />
            <input
              placeholder='Views display (e.g. "9K")'
              {...field('views')}
              style={inputStyle}
            />
            <input
              placeholder="Thumbnail URL *"
              required
              {...field('thumbnailUrl')}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder="Order (0 = first)"
              {...field('order')}
              style={inputStyle}
            />
            <input
              placeholder="YouTube Embed URL * (https://www.youtube.com/embed/VIDEO_ID)"
              required
              {...field('videoUrl')}
              style={{ ...inputStyle, gridColumn: '1 / -1' }}
            />
            <input
              placeholder="Description (optional)"
              {...field('description')}
              style={{ ...inputStyle, gridColumn: '1 / -1' }}
            />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={cancelEdit} style={cancelBtnStyle}>
                Cancel
              </button>
              <button type="submit" style={submitBtnStyle} disabled={createMut.isPending || updateMut.isPending}>
                {editId ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className={styles.error}>Failed to load video testimonials.</div>}
      {isLoading ? <Loader /> : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Title</th>
                <th>Views</th>
                <th>Order</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>No video testimonials yet. Click "+ Add Video" to get started.</td></tr>
              ) : items.map(item => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      style={{ width: 64, aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8, display: 'block' }}
                    />
                  </td>
                  <td><strong>{item.title}</strong>{item.description && <div style={{ fontSize: '0.78rem', color: 'var(--muted, #8A8A8E)', marginTop: 2 }}>{item.description}</div>}</td>
                  <td><span className={styles.badge}>{item.views || '—'}</span></td>
                  <td>{item.order}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{
                        background: item.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)',
                        color: item.isActive ? '#10b981' : '#64748b',
                      }}
                    >
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => startEdit(item)}
                      style={editBtnStyle}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      disabled={deleteMut.isPending}
                      onClick={() => { if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) deleteMut.mutate(item._id); }}
                    >
                      Delete
                    </button>
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

const inputStyle = {
  padding: '0.55rem 0.9rem',
  border: '1px solid var(--border, #E8E3DB)',
  borderRadius: 8,
  fontSize: '0.875rem',
  background: '#fff',
  color: 'var(--charcoal, #1C1C1E)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const submitBtnStyle = {
  padding: '0.55rem 1.25rem',
  background: 'var(--gold, #C9A84C)',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
};

const cancelBtnStyle = {
  padding: '0.55rem 1.25rem',
  background: 'transparent',
  color: 'var(--muted, #8A8A8E)',
  border: '1px solid var(--border, #E8E3DB)',
  borderRadius: 8,
  fontWeight: 500,
  fontSize: '0.875rem',
  cursor: 'pointer',
};

const editBtnStyle = {
  padding: '0.35rem 0.85rem',
  background: 'transparent',
  border: '1px solid var(--border, #E8E3DB)',
  color: 'var(--charcoal, #1C1C1E)',
  borderRadius: 6,
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
};
