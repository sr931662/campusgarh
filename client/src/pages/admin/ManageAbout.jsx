import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import styles from './AdminForm.module.css';

const fetchAbout = () => api.get('/about');
const saveAbout  = (data) => api.put('/about', data);

const EMPTY = {
  heroTitle:    '',
  heroSubtitle: '',
  missionText:  '',
  whoWeAreText: '',
  stats:  [{ value: '', label: '' }],
  values: [{ title: '', desc: '', icon: '' }],
  team:   [{ name: '', role: '', desc: '', imgUrl: '', initials: '', linkedin: '', twitter: '', instagram: '' }],
  faqs:   [{ q: '', a: '' }],
};

/* ── tiny helpers ── */
const addItem   = (arr, blank) => [...arr, { ...blank }];
const removeItem = (arr, i) => arr.filter((_, idx) => idx !== i);
const updateItem = (arr, i, key, val) => arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item);

export default function ManageAbout() {
  const qc = useQueryClient();
  const [form, setForm]   = useState(EMPTY);
  const [saved, setSaved] = useState(false);

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
      faqs:   d.faqs?.length   ? d.faqs   : EMPTY.faqs,
    });
  }, [data]);

  const mutation = useMutation({
    mutationFn: saveAbout,
    onSuccess: () => { qc.invalidateQueries(['about-admin']); setSaved(true); setTimeout(() => setSaved(false), 3000); },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (isLoading) return <div className={styles.container}><p style={{ color: '#6b7280', padding: '2rem' }}>Loading…</p></div>;

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>Manage About Page</h1>
        <p>Edit all content on the public About page</p>
      </div>

      {/* ── LIVE PREVIEW ── */}
      <div style={{ background: '#F9F7F3', borderRadius: 16, border: '1.5px solid #E8E3DB', padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A84C' }}>Live Preview</span>
          <a href="/about" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'none' }}>Open About Page ↗</a>
        </div>

        {/* Hero */}
        {(form.heroTitle || form.heroSubtitle) && (
          <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: '#1C1C1E', borderRadius: 10 }}>
            {form.heroTitle && <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFEF9', marginBottom: '0.3rem' }} dangerouslySetInnerHTML={{ __html: form.heroTitle }} />}
            {form.heroSubtitle && <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{form.heroSubtitle}</div>}
          </div>
        )}

        {/* Stats */}
        {form.stats?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {form.stats.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E3DB', borderRadius: 8, padding: '0.45rem 0.85rem', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#C9A84C' }}>{s.value || '—'}</div>
                <div style={{ fontSize: '0.62rem', color: '#8A8A8E', marginTop: 2 }}>{s.label || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* CEO card */}
        {form.team?.[0]?.name && (() => {
          const ceo = form.team[0];
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg,#C9A84C,#E8C97A)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2D2D2D', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {ceo.imgUrl ? <img src={ceo.imgUrl} alt={ceo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (ceo.initials || ceo.name?.[0])}
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(10,10,15,0.55)', marginBottom: 2 }}>{ceo.role}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0A0A0F' }}>{ceo.name}</div>
                {ceo.desc && <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'rgba(10,10,15,0.6)', marginTop: 3 }}>"{ceo.desc}"</div>}
                <div style={{ fontSize: '0.68rem', color: 'rgba(10,10,15,0.45)', marginTop: 5 }}>
                  {[ceo.instagram && 'Instagram', ceo.linkedin && 'LinkedIn', ceo.twitter && 'X/Twitter'].filter(Boolean).join(' · ') || 'No social links'}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Staff cards */}
        {form.team?.slice(1, 5).some(m => m.name) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {form.team.slice(1, 5).filter(m => m.name).map((m, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E3DB', borderRadius: 8, padding: '0.65rem 0.9rem', minWidth: 110 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2D2D2D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  {m.initials || m.name?.[0]}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1C1C1E' }}>{m.name}</div>
                <div style={{ fontSize: '0.66rem', color: '#8A8A8E' }}>{m.role}</div>
              </div>
            ))}
          </div>
        )}
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
          <div className={styles.field}>
            <label>Who We Are (supports markdown)</label>
            <textarea rows={4} value={form.whoWeAreText} onChange={e => set('whoWeAreText', e.target.value)}
              placeholder="CampusGarh is a modern student-support platform..." style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>
          <div className={styles.field}>
            <label>Mission Text (supports markdown)</label>
            <textarea rows={3} value={form.missionText} onChange={e => set('missionText', e.target.value)}
              placeholder="To empower every student with clarity..." style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
          </div>
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
                  <label>Photo URL (optional)</label>
                  <input value={m.imgUrl} onChange={e => set('team', updateItem(form.team, i, 'imgUrl', e.target.value))} placeholder="https://..." />
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

        {/* ── FAQs ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>FAQs</div>
          {form.faqs.map((f, i) => (
            <div key={i} style={{ background: '#F9F7F3', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
              <div className={styles.field}>
                <label>Question</label>
                <input value={f.q} onChange={e => set('faqs', updateItem(form.faqs, i, 'q', e.target.value))} placeholder="What is CampusGarh?" />
              </div>
              <div className={styles.field}>
                <label>Answer</label>
                <textarea rows={2} value={f.a} onChange={e => set('faqs', updateItem(form.faqs, i, 'a', e.target.value))} placeholder="CampusGarh is a student-first..." />
              </div>
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
