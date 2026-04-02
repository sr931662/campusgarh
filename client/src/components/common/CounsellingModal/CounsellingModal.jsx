import React, { useState } from 'react';
import styles from './CounsellingModal.module.css';
import { FiX } from 'react-icons/fi';

const CounsellingModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', phone: '', stream: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'free_counselling' }),
      });
      setStatus('success');
    } catch { setStatus('error'); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}><FiX size={20} /></button>
        {status === 'success' ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3>We'll be in touch!</h3>
            <p>Our counselor will call you within 24 hours.</p>
            <button className={styles.doneBtn} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className={styles.eyebrow}>Free Counselling</p>
            <h2 className={styles.title}>Talk to an Expert — Free</h2>
            <p className={styles.sub}>Get personalised guidance from our admission counselors.</p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input className={styles.input} placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input className={styles.input} placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              <select className={styles.input} value={form.stream} onChange={e => setForm({...form, stream: e.target.value})}>
                <option value="">Select Stream</option>
                <option>Engineering & Technology</option>
                <option>Medical & Health Sciences</option>
                <option>Management & Business</option>
                <option>Law</option>
                <option>Arts & Science</option>
              </select>
              <textarea className={styles.input} placeholder="Any specific queries? (optional)" rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              <button type="submit" className={styles.submit} disabled={status === 'loading'}>
                {status === 'loading' ? 'Submitting...' : 'Get Free Counselling →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CounsellingModal;
