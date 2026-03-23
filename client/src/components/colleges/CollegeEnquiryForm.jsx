import { useState } from 'react';
import { useCreateEnquiry } from '../../hooks/queries';
import styles from './CollegeEnquiryForm.module.css';

// Generate a deterministic accent color from college name
function accentFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

function initials(name = '', shortName = '') {
  const source = shortName || name;
  return source.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function CollegeEnquiryForm({ college }) {
  const accent = accentFromName(college.name);
  const [form, setForm] = useState({ studentName: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const { mutate: createEnquiry, isPending } = useCreateEnquiry();

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentName || !form.phone || !form.email) return;
    createEnquiry(
      { ...form, collegeInterest: college._id, source: 'website', sourceUrl: window.location.href },
      { onSuccess: () => setSubmitted(true) }
    );
  };

  return (
    <div className={styles.card}>
      {/* Header with logo */}
      <div className={styles.header} style={{ background: accent }}>
        <div className={styles.logo}>
          {college.logoUrl ? (
            <img src={college.logoUrl} alt={college.name} className={styles.logoImg} />
          ) : (
            <span className={styles.logoInitials} style={{ color: accent }}>
              {initials(college.name, college.shortName)}
            </span>
          )}
        </div>
        <div className={styles.headerText}>
          <p className={styles.headerLabel}>Get Free Counselling</p>
          <p className={styles.headerCollege}>{college.shortName || college.name}</p>
        </div>
      </div>

      {submitted ? (
        <div className={styles.success}>
          <span className={styles.successIcon}>✓</span>
          <p className={styles.successTitle}>Request Sent!</p>
          <p className={styles.successSub}>Our counsellor will contact you within 24 hours.</p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Full Name <span>*</span></label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.studentName}
              onChange={set('studentName')}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Phone <span>*</span></label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={form.phone}
              onChange={set('phone')}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Email <span>*</span></label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={set('email')}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>Message</label>
            <textarea
              placeholder="Which course are you interested in?"
              value={form.message}
              onChange={set('message')}
              rows={3}
              className={styles.textarea}
            />
          </div>
          <button
            type="submit"
            className={styles.submitBtn}
            style={{ background: accent }}
            disabled={isPending}
          >
            {isPending ? 'Sending…' : 'Get Free Counselling'}
          </button>
          <p className={styles.disclaimer}>
            Free service · No spam · We respect your privacy
          </p>
        </form>
      )}
    </div>
  );
}
