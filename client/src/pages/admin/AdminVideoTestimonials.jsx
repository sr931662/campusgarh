import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoTestimonialService } from '../../services/videoTestimonialService';

const empty = { title: '', description: '', thumbnailUrl: '', videoUrl: '', views: '', order: 0 };

export default function AdminVideoTestimonials() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const { data } = useQuery({
    queryKey: ['video-testimonials'],
    queryFn: () => videoTestimonialService.getAll().then(r => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries(['video-testimonials']);

  const createMut = useMutation({
    mutationFn: videoTestimonialService.create,
    onSuccess: () => { invalidate(); setForm(empty); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => videoTestimonialService.update(id, data),
    onSuccess: () => { invalidate(); setForm(empty); setEditId(null); },
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
    });
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div style={{ padding: '24px', maxWidth: 900 }}>
      <h2>Video Testimonials</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 500, marginBottom: 32 }}>
        <input placeholder="Title *" required {...field('title')} />
        <input placeholder="Description" {...field('description')} />
        <input placeholder="Thumbnail URL *" required {...field('thumbnailUrl')} />
        <input placeholder="YouTube Embed URL *" required {...field('videoUrl')}
          title="Use embed URL: https://www.youtube.com/embed/VIDEO_ID" />
        <input placeholder='Views display (e.g. "9K")' {...field('views')} />
        <input type="number" placeholder="Order (0 = first)" {...field('order')} />
        <button type="submit" style={{ background: '#1a56db', color: '#fff', padding: '10px', border: 'none', borderRadius: 6 }}>
          {editId ? 'Update' : 'Add'} Testimonial
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>
            Cancel
          </button>
        )}
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={th}>Thumbnail</th>
            <th style={th}>Title</th>
            <th style={th}>Views</th>
            <th style={th}>Order</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(data || []).map(item => (
            <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={td}>
                <img src={item.thumbnailUrl} alt="" style={{ width: 60, borderRadius: 8 }} />
              </td>
              <td style={td}>{item.title}</td>
              <td style={td}>{item.views}</td>
              <td style={td}>{item.order}</td>
              <td style={td}>
                <button onClick={() => startEdit(item)} style={{ marginRight: 8 }}>Edit</button>
                <button
                  onClick={() => { if (confirm('Delete?')) deleteMut.mutate(item._id); }}
                  style={{ color: 'red' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '10px 12px' };
