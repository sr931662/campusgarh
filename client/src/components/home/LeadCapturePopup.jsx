import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaGraduationCap } from 'react-icons/fa';
import { enquiryService } from '../../services/enquiryService';
import styles from './LeadCapturePopup.module.css';

const STORAGE_KEY = 'cg_popup_dismissed';

const LeadCapturePopup = () => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState('prompt'); // prompt | form | success
  const [form, setForm] = useState({ studentName: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 8000); // show after 8s
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg('');
    try {
      await enquiryService.createEnquiry({ ...form, source: 'website' });
      setStep('success');
    } catch (err) {
      setErrMsg(err?.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={dismiss}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={dismiss} aria-label="Close"><FaTimes /></button>

        {step === 'prompt' && (
          <div className={styles.promptBody}>
            <div className={styles.iconWrap}><FaGraduationCap /></div>
            <h2 className={styles.title}>Find Your Perfect College</h2>
            <p className={styles.sub}>Get free personalised counselling from our experts — no spam, ever.</p>
            <div className={styles.promptBtns}>
              <button className={styles.btnPrimary} onClick={() => setStep('form')}>Get Free Counselling</button>
              <button className={styles.btnSecondary} onClick={() => { dismiss(); navigate('/login'); }}>Sign In</button>
            </div>
            <button className={styles.skip} onClick={dismiss}>Maybe later</button>
          </div>
        )}

        {step === 'form' && (
          <div className={styles.formBody}>
            <h2 className={styles.title}>Quick Enquiry</h2>
            <p className={styles.sub}>Fill in your details and we'll call you within 24 hours.</p>
            {errMsg && <div className={styles.errorMsg}>{errMsg}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <input name="studentName" value={form.studentName} onChange={handleChange} required placeholder="Your Name *" className={styles.input} />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="Phone Number *" className={styles.input} />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email Address *" className={styles.input} />
              <input name="message" value={form.message} onChange={handleChange} placeholder="Course / Stream interest (optional)" className={styles.input} />
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Submitting...' : 'Request Callback'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.successBody}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>You're All Set!</h2>
            <p className={styles.sub}>Our counsellor will call you within 24 hours. Check your email for confirmation.</p>
            <button className={styles.btnPrimary} onClick={dismiss}>Continue Exploring</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCapturePopup;
