import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHandshake, FaRupeeSign, FaUserGraduate, FaChartLine, FaBolt, FaCheckCircle } from 'react-icons/fa';
import { partnerService } from '../services/partnerService';
import styles from './PartnershipProgram.module.css';

const BENEFITS = [
  { icon: <FaRupeeSign />,      title: 'Earn Commission',      desc: 'Get paid for every student whose admission gets confirmed through your referral.' },
  { icon: <FaUserGraduate />,   title: 'Grow Your Network',    desc: 'Access 500+ colleges and 1,200+ courses to guide your students better.' },
  { icon: <FaChartLine />,      title: 'Track Your Impact',    desc: 'Real-time dashboard to monitor leads, conversions, and earnings.' },
  { icon: <FaBolt />,           title: 'Fast Payouts',         desc: 'Transparent payouts within 30 days of confirmed admission.' },
];

const STEPS = [
  'Submit your application below',
  'Our team reviews and approves within 48 hours',
  'You get a unique partner link & dashboard access',
  'Refer students → lead gets tracked under your name',
  'Student gets admission confirmed → you earn commission',
];

export default function PartnershipProgram() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', type: '', experience: '', studentsPerMonth: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrMsg('');
    try {
      await partnerService.apply(form);
      setStatus('success');
    } catch (err) {
      setErrMsg(err?.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>CampusGarh Partnership Program</p>
          <h1 className={styles.heroTitle}>
            Earn While You <span>Guide Students</span>
          </h1>
          <p className={styles.heroSub}>
            Are you a teacher, counselor, or educator? Join CampusGarh as a Partner and earn commission for every confirmed admission you help us close.
          </p>
          <a href="#apply" className={styles.heroCta}>Apply Now — It's Free</a>
        </div>
      </section>

      {/* Benefits */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Partner with <span>CampusGarh?</span></h2>
          <div className={styles.benefitsGrid}>
            {BENEFITS.map(b => (
              <div key={b.title} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{b.icon}</span>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It <span>Works</span></h2>
          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <p className={styles.stepText}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className={styles.formSection} id="apply">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Apply to <span>Become a Partner</span></h2>
          <p className={styles.formSub}>Fill in the details below and our team will reach out within 48 hours.</p>

          {status === 'success' ? (
            <div className={styles.successBox}>
              <FaCheckCircle className={styles.successIcon} />
              <h3>Application Submitted!</h3>
              <p>Thank you! Our team will contact you within 48 hours on your phone/email.</p>
              <Link to="/" className={styles.backHome}>Back to Home</Link>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              {errMsg && <div className={styles.errorMsg}>{errMsg}</div>}
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Full Name <span>*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" />
                </div>
                <div className={styles.field}>
                  <label>Email <span>*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Phone <span>*</span></label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" />
                </div>
                <div className={styles.field}>
                  <label>City <span>*</span></label>
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="Your city" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>I am a <span>*</span></label>
                  <select name="type" value={form.type} onChange={handleChange} required>
                    <option value="">Select type</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Counselor">Independent Counselor</option>
                    <option value="Institute">Institute / Coaching Center</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Years of Experience</label>
                  <input name="experience" type="number" value={form.experience} onChange={handleChange} placeholder="e.g. 5" min="0" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Approx. students you counsel per month</label>
                <input name="studentsPerMonth" type="number" value={form.studentsPerMonth} onChange={handleChange} placeholder="e.g. 20" min="0" />
              </div>
              <div className={styles.field}>
                <label>Tell us about yourself (optional)</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="How do you currently guide students? What subjects/streams do you specialize in?" />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                {status === 'loading' ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
