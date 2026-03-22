import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { blogService } from '../../services/blogService';
import { BLOG_STATUS } from '../../utils/constants';
import styles from './AdminForm.module.css';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    excerpt: '',        // schema field is 'excerpt', not 'summary'
    content: '',
    tags: '',
    status: BLOG_STATUS.DRAFT,
    // Note: 'author' is set by backend from req.user (required in schema)
    // Note: 'categories' is ObjectId[] ref to BlogCategory — not handled here
    // Note: 'featuredImage' is ObjectId ref to Media — not handled here
    contentType: 'Guide',
    difficulty: '',
    featured: false,
    seriesName: '',
    seriesPartNumber: '',
    seriesTotalParts: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => blogService.createBlog(data),
    onSuccess: () => navigate('/dashboard/admin'),
    onError: (err) => setError(err?.response?.data?.message || 'Failed to create blog post'),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title,
      content: form.content,
      excerpt: form.excerpt || undefined,
      tags: form.tags
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      status: form.status,
      contentType: form.contentType || 'Guide',
      difficulty: form.difficulty || undefined,
      featured: form.featured,
      series: form.seriesName ? {
        name: form.seriesName,
        partNumber: form.seriesPartNumber ? Number(form.seriesPartNumber) : undefined,
        totalParts: form.seriesTotalParts ? Number(form.seriesTotalParts) : undefined,
      } : undefined,
    };
    mutation.mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Write Blog Post</h1>
        <p>Create a new blog article for the platform</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

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

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Content <span style={{ color: 'var(--gold)' }}>*</span></div>
          <div className={styles.field}>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              placeholder="Write the full blog post content here. Markdown is supported..."
              rows={18}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
            />
            <span className={styles.hint}>Markdown supported</span>
          </div>
        </div>

        {/* Content Classification */}
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

        {/* Series */}
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
          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : form.status === BLOG_STATUS.PUBLISHED ? 'Publish Post' : 'Save Draft'}
          </button>
          <Link to="/dashboard/admin" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
