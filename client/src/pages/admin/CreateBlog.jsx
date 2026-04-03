import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { blogService } from '../../services/blogService';
import { mediaService } from '../../services/mediaService';
import { BLOG_STATUS } from '../../utils/constants';
import styles from './AdminForm.module.css';

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  status: BLOG_STATUS.DRAFT,
  contentType: 'Guide',
  difficulty: '',
  featured: false,
  featuredImageUrl: '',
  seriesName: '',
  seriesPartNumber: '',
  seriesTotalParts: '',
};

const CreateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // edit mode if id exists
  const isEdit = !!id;

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  // Load existing blog when editing
  const { data: blogData, isLoading: loadingBlog } = useQuery({
    queryKey: ['blog-edit', id],
    queryFn: () => blogService.getBlogById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!blogData) return;
    const b = blogData?.data?.data;
    if (!b) return;
    setForm({
      title:             b.title || '',
      excerpt:           b.excerpt || '',
      content:           b.content || '',
      tags:              (b.tags || []).join(', '),
      status:            b.status || BLOG_STATUS.DRAFT,
      contentType:       b.contentType || 'Guide',
      difficulty:        b.difficulty || '',
      featured:          b.featured || false,
      featuredImageUrl:  b.featuredImageUrl || '',
      seriesName:        b.series?.name || '',
      seriesPartNumber:  b.series?.partNumber ?? '',
      seriesTotalParts:  b.series?.totalParts ?? '',
    });
  }, [blogData]);

  const createMutation = useMutation({
    mutationFn: (data) => blogService.createBlog(data),
    onSuccess: () => navigate('/admin/blogs'),
    onError:   (err) => setError(err?.response?.data?.message || 'Failed to create blog post'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => blogService.updateBlog(id, data),
    onSuccess: () => navigate('/admin/blogs'),
    onError:   (err) => setError(err?.response?.data?.message || 'Failed to update blog post'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', 'image');
      const res = await mediaService.uploadFile(fd);
      const url = res?.data?.data?.url || res?.data?.url || '';
      setForm(p => ({ ...p, featuredImageUrl: url }));
    } catch {
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title:       form.title,
      content:     form.content,
      excerpt:     form.excerpt || undefined,
      tags:        form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      status:      form.status,
      contentType: form.contentType || 'Guide',
      difficulty:  form.difficulty || undefined,
      featured:    form.featured,
      featuredImageUrl: form.featuredImageUrl || undefined,
      series:      form.seriesName ? {
        name:       form.seriesName,
        partNumber: form.seriesPartNumber ? Number(form.seriesPartNumber) : undefined,
        totalParts: form.seriesTotalParts  ? Number(form.seriesTotalParts)  : undefined,
      } : undefined,
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isEdit && loadingBlog) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'rgba(255,255,255,0.5)', padding: '2rem' }}>Loading post…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link to="/admin/blogs" className={styles.backLink}>← Back to Blogs</Link>
      <div className={styles.header}>
        <h1>{isEdit ? 'Edit Blog Post' : 'Write Blog Post'}</h1>
        <p>{isEdit ? 'Update the blog article' : 'Create a new blog article for the platform'}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        {/* ── Post Details ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Post Details</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Title <span>*</span></label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Top Engineering Colleges in India 2025" />
            </div>
            <div className={styles.field}>
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value={BLOG_STATUS.DRAFT}>Draft</option>
                <option value={BLOG_STATUS.PUBLISHED}>Published</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Excerpt</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Short description shown on listing pages (2-3 sentences)..." rows={3} />
          </div>
          <div className={styles.field}>
            <label>Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="JEE, IIT, Engineering, Admission" />
            <span className={styles.hint}>Comma-separated tags</span>
          </div>
        </div>

        {/* ── Featured Image ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Featured / Cover Image</div>
          {form.featuredImageUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <img
                src={form.featuredImageUrl}
                alt="Cover preview"
                style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                type="button"
                onClick={() => { setForm(p => ({ ...p, featuredImageUrl: '' })); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ display: 'block', marginTop: '0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 6, padding: '0.25rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                Remove Image
              </button>
            </div>
          )}
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Upload Image</label>
              <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} style={{ color: 'rgba(255,255,255,0.6)' }} />
              {uploading && <span style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>Uploading…</span>}
            </div>
            <div className={styles.field}>
              <label>Or paste Image URL</label>
              <input
                name="featuredImageUrl"
                value={form.featuredImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/cover.jpg"
              />
              <span className={styles.hint}>Direct URL of the cover image</span>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Content <span style={{ color: 'var(--gold)' }}>*</span></div>
          <div className={styles.field}>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              placeholder="Write the full blog post content here. Markdown is supported..."
              rows={20}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
            <span className={styles.hint}>Markdown supported</span>
          </div>
        </div>

        {/* ── Content Classification ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Content Classification</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Content Type</label>
              <select name="contentType" value={form.contentType} onChange={handleChange}>
                <option value="Guide">Guide</option>
                <option value="News">News</option>
                <option value="Ranking">Ranking</option>
                <option value="College Review">College Review</option>
                <option value="Exam Update">Exam Update</option>
                <option value="Career Advice">Career Advice</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Comparison">Comparison</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Difficulty Level</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option value="">None</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} />
            <label htmlFor="featured">Feature this post on homepage</label>
          </div>
        </div>

        {/* ── Series ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Series (optional)</div>
          <div className={styles.field}>
            <label>Series Name</label>
            <input name="seriesName" value={form.seriesName} onChange={handleChange} placeholder="e.g. IIT JEE Complete Guide" />
          </div>
          {form.seriesName && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Part Number</label>
                <input name="seriesPartNumber" type="number" value={form.seriesPartNumber} onChange={handleChange} placeholder="e.g. 1" min="1" />
              </div>
              <div className={styles.field}>
                <label>Total Parts</label>
                <input name="seriesTotalParts" type="number" value={form.seriesTotalParts} onChange={handleChange} placeholder="e.g. 5" min="1" />
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending
              ? 'Saving…'
              : isEdit
                ? 'Update Post'
                : form.status === BLOG_STATUS.PUBLISHED ? 'Publish Post' : 'Save Draft'}
          </button>
          <Link to="/admin/blogs" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
