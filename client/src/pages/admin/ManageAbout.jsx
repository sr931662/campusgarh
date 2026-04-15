import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import styles from './AdminForm.module.css';

import MarkdownField from '../../components/common/MarkdownField/MarkdownField';
const fetchAbout = () => api.get('/about');
const saveAbout  = (data) => api.put('/about', data);

const EMPTY = {
  heroTitle:    '',
  heroSubtitle: '',
  missionText:  '',
  whoWeAreText: '',
  stats:    [{ value: '', label: '' }],
  values:   [{ title: '', desc: '', icon: '' }],
  team:     [{ name: '', role: '', desc: '', imgUrl: '', initials: '', linkedin: '', twitter: '', instagram: '' }],
  faqs:     [{ q: '', a: '' }],
  whatWeDo: [{ icon: '', title: '', desc: '' }],
};

/* ── tiny helpers ── */
const addItem   = (arr, blank) => [...arr, { ...blank }];
const removeItem = (arr, i) => arr.filter((_, idx) => idx !== i);
const updateItem = (arr, i, key, val) => arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item);

export default function ManageAbout() {
  const qc = useQueryClient();
  const [form, setForm]   = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['about-admin'], queryFn: fetchAbout });

  useEffect(() => {
    const d = data?.data?.data;
    if (!d) return;
    setForm({
      heroTitle:    d.heroTitle    || '',
      heroSubtitle: d.heroSubtitle || '',
      missionText:  d.missionText  || '',
      whoWeAreText: d.whoWeAreText || '',
      stats:  d.stats?.length  ? d.stats  : EMPTY.stats,
      values: d.values?.length ? d.values : EMPTY.values,
      team:   d.team?.length   ? d.team   : EMPTY.team,
      faqs:     d.faqs?.length     ? d.faqs     : EMPTY.faqs,
      whatWeDo: d.whatWeDo?.length ? d.whatWeDo : EMPTY.whatWeDo,
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveAbout,
    onSuccess: () => { qc.invalidateQueries(['about-admin']); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const uploadPhoto = async (file, idx) => {
    setUploadingIdx(idx);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', 'image');
    try {
      const res = await api.post('/media/upload', fd);
      const url = res.data?.data?.url;
      if (url) set('team', updateItem(form.team, idx, 'imgUrl', url));
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingIdx(null);
    }
  };

  if (isLoading) return <div className={styles.container}><p style={{ color: '#6b7280', padding: '2rem' }}>Loading…</p></div>;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage About Page</h1>
        <p>Edit all content on the public About page</p>
      </div>

      

      <form className={styles.form} onSubmit={e => { e.preventDefault(); mutation.mutate(form); }}>


        {/* ── HERO ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Hero Section</div>
          <div className={styles.field}>
            <label>Hero Title</label>
            <input value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)}
              placeholder="India's Most Trusted Student Platform" />
          </div>
          <div className={styles.field}>
            <label>Hero Subtitle</label>
            <textarea rows={2} value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)}
              placeholder="CampusGarh was built with a single belief..." />
          </div>
        </div>

        {/* ── WHO WE ARE + MISSION ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Who We Are / Mission</div>
          <MarkdownField
            label="Who We Are"
            name="whoWeAreText"
            value={form.whoWeAreText}
            onChange={e => set('whoWeAreText', e.target.value)}
            placeholder="CampusGarh is a modern student-support platform..."
            rows={4}
          />

          <MarkdownField
            label="Mission Text"
            name="missionText"
            value={form.missionText}
            onChange={e => set('missionText', e.target.value)}
            placeholder="To empower every student with clarity..."
            rows={3}
          />

        </div>

        {/* ── STATS ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Stats Bar</div>
          {form.stats.map((s, i) => (
            <div key={i} className={styles.row} style={{ marginBottom: '0.75rem', alignItems: 'center' }}>
              <div className={styles.field}>
                <label>Value</label>
                <input value={s.value} onChange={e => set('stats', updateItem(form.stats, i, 'value', e.target.value))} placeholder="5,000+" />
              </div>
              <div className={styles.field}>
                <label>Label</label>
                <input value={s.label} onChange={e => set('stats', updateItem(form.stats, i, 'label', e.target.value))} placeholder="Colleges Listed" />
              </div>
              <button type="button" onClick={() => set('stats', removeItem(form.stats, i))}
                style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', flexShrink: 0 }}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('stats', addItem(form.stats, { value: '', label: '' }))}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.83rem' }}>
            + Add Stat
          </button>
        </div>

        {/* ── CORE VALUES ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Core Values</div>
          {form.values.map((v, i) => (
            <div key={i} style={{ background: '#F9F7F3', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Title</label>
                  <input value={v.title} onChange={e => set('values', updateItem(form.values, i, 'title', e.target.value))} placeholder="Transparency" />
                </div>
                <div className={styles.field}>
                  <label>Icon (emoji or react-icon name)</label>
                  <input value={v.icon} onChange={e => set('values', updateItem(form.values, i, 'icon', e.target.value))} placeholder="🔍" />
                </div>
                <button type="button" onClick={() => set('values', removeItem(form.values, i))}
                  style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', flexShrink: 0 }}>
                  Remove
                </button>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <textarea rows={2} value={v.desc} onChange={e => set('values', updateItem(form.values, i, 'desc', e.target.value))} placeholder="Honest, bias-free information..." />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set('values', addItem(form.values, { title: '', desc: '', icon: '' }))}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.83rem' }}>
            + Add Value
          </button>
        </div>

        {/* ── TEAM ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Team Members</div>
          {form.team.map((m, i) => (
            <div key={i} style={{ background: '#F9F7F3', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input value={m.name} onChange={e => set('team', updateItem(form.team, i, 'name', e.target.value))} placeholder="Priyanshu Saraswat" />
                </div>
                <div className={styles.field}>
                  <label>Role / Designation</label>
                  <input value={m.role} onChange={e => set('team', updateItem(form.team, i, 'role', e.target.value))} placeholder="Founder & CEO" />
                </div>
                <div className={styles.field}>
                  <label>Initials (fallback avatar)</label>
                  <input value={m.initials} onChange={e => set('team', updateItem(form.team, i, 'initials', e.target.value))} placeholder="PS" maxLength={3} />
                </div>
              </div>
              <div className={styles.field}>
                <label>Bio / Description</label>
                <textarea rows={2} value={m.desc} onChange={e => set('team', updateItem(form.team, i, 'desc', e.target.value))} placeholder="Visionary behind CampusGarh..." />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Photo (URL or Upload)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      value={m.imgUrl}
                      onChange={e => set('team', updateItem(form.team, i, 'imgUrl', e.target.value))}
                      placeholder="https://..."
                      style={{ flex: 1 }}
                    />
                    <label style={{ flexShrink: 0, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.45rem 0.8rem', cursor: uploadingIdx === i ? 'wait' : 'pointer', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {uploadingIdx === i ? 'Uploading…' : '📁 Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingIdx !== null}
                        onChange={e => { if (e.target.files[0]) uploadPhoto(e.target.files[0], i); }}
                      />
                    </label>
                    {m.imgUrl && (
                      <img
                        src={m.imgUrl}
                        alt="preview"
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E8E3DB', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                </div>
                <div className={styles.field}>
                  <label>LinkedIn URL</label>
                  <input value={m.linkedin} onChange={e => set('team', updateItem(form.team, i, 'linkedin', e.target.value))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className={styles.field}>
                  <label>Twitter / X URL</label>
                  <input value={m.twitter} onChange={e => set('team', updateItem(form.team, i, 'twitter', e.target.value))} placeholder="https://x.com/..." />
                </div>
                <div className={styles.field}>
                  <label>Instagram URL</label>
                  <input value={m.instagram || ''} onChange={e => set('team', updateItem(form.team, i, 'instagram', e.target.value))} placeholder="https://instagram.com/..." />
                </div>
              </div>

              <button type="button" onClick={() => set('team', removeItem(form.team, i))}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                Remove Member
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('team', addItem(form.team, { name: '', role: '', desc: '', imgUrl: '', initials: '', linkedin: '', twitter: '', instagram: '' }))}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.83rem' }}>
            + Add Team Member
          </button>
        </div>
        
        {/* ── WHAT WE DO ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>What We Do</div>
          {form.whatWeDo.map((w, i) => (
            <div key={i} style={{ background: '#F9F7F3', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.row}>
                <div className={styles.field} style={{ maxWidth: 80 }}>
                  <label>Icon (emoji)</label>
                  <input value={w.icon} onChange={e => set('whatWeDo', updateItem(form.whatWeDo, i, 'icon', e.target.value))} placeholder="🤝" />
                </div>
                <div className={styles.field}>
                  <label>Title</label>
                  <input value={w.title} onChange={e => set('whatWeDo', updateItem(form.whatWeDo, i, 'title', e.target.value))} placeholder="Genuine College Reviews" />
                </div>
                <button type="button" onClick={() => set('whatWeDo', removeItem(form.whatWeDo, i))}
                  style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', flexShrink: 0 }}>
                  Remove
                </button>
              </div>
              <div className={styles.field}>
                <label>Description</label>
                <input value={w.desc} onChange={e => set('whatWeDo', updateItem(form.whatWeDo, i, 'desc', e.target.value))} placeholder="Transparent, real-campus insights." />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set('whatWeDo', addItem(form.whatWeDo, { icon: '', title: '', desc: '' }))}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.83rem' }}>
            + Add Item
          </button>
        </div>

        {/* ── FAQs ── */}

        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>FAQs</div>
          {form.faqs.map((f, i) => (
            <div key={i} style={{ background: '#F9F7F3', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.field}>
                <label>Question</label>
                <input value={f.q} onChange={e => set('faqs', updateItem(form.faqs, i, 'q', e.target.value))} placeholder="What is CampusGarh?" />
              </div>
              <MarkdownField
                label="Answer"
                name={`faq-a-${i}`}
                value={f.a}
                onChange={e => set('faqs', updateItem(form.faqs, i, 'a', e.target.value))}
                placeholder="CampusGarh is a student-first..."
                rows={2}
              />

              <button type="button" onClick={() => set('faqs', removeItem(form.faqs, i))}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                Remove FAQ
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('faqs', addItem(form.faqs, { q: '', a: '' }))}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.83rem' }}>
            + Add FAQ
          </button>
        </div>

        {/* ── SUBMIT ── */}
        <div className={styles.actions}>
          {saved && <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓ Saved successfully!</span>}
          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save About Page'}
          </button>
          <Link to="/dashboard/admin" className={styles.cancelLink}>Cancel</Link>
        </div>

      </form>
    </div>
  );
}
