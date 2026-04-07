import React, { useState } from 'react';
import { FaUsers, FaChartLine, FaBullseye, FaStar, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './AdvertiseWithUs.module.css';

const STATS = [
  { value: '5L+', label: 'Monthly Visitors' },
  { value: '10L+', label: 'Students Reached' },
  { value: '500+', label: 'Colleges Listed' },
  { value: '80+', label: 'Exams Covered' },
];

const AD_OPTIONS = [
  {
    icon: <FaBullseye />,
    title: 'Featured College Listing',
    desc: 'Get your college featured prominently on search results, comparison pages, and category listings. Reach students actively searching for your institution.',
    price: 'Starting ₹15,000/mo',
  },
  {
    icon: <FaChartLine />,
    title: 'Banner & Display Ads',
    desc: 'Place targeted banner ads across college listing pages, exam pages, and the home page. High visibility for maximum brand reach.',
    price: 'Starting ₹8,000/mo',
  },
  {
    icon: <FaStar />,
    title: 'Sponsored Content',
    desc: 'Publish articles, guides, or rankings featuring your institution. Blends naturally with editorial content — high trust, high engagement.',
    price: 'Starting ₹20,000/article',
  },
  {
    icon: <FaUsers />,
    title: 'Lead Generation',
    desc: 'Receive qualified student enquiries directly in your CRM. Pay-per-lead model available. All leads are pre-screened for relevance.',
    price: 'Pay-per-lead',
  },
];

const PROCESS = [
  'Fill out the enquiry form below with your institute/brand details',
  'Our partnerships team contacts you within 48 hours',
  'We propose a custom advertising plan based on your goals and budget',
  'Campaign goes live — you get a live dashboard to track performance',
];

const AdvertiseWithUs = () => {
  const [form, setForm] = useState({ name: '', org: '', email: '', phone: '', interest: '', budget: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Reach 5 Lakh+ Students</p>
          <h1 className={styles.heroTitle}>Advertise with <span>CampusGarh</span></h1>
          <p className={styles.heroSub}>
            Connect your institution or brand with students who are actively making education decisions.
            Targeted, trust-driven, and results-focused.
          </p>
          <a href="#enquire" className={styles.heroCta}>Get a Custom Plan</a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statBox}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD OPTIONS ── */}
      <section className={styles.optionsSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Advertising Solutions</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Choose the Right <span>Format</span>
          </h2>
          <div className={styles.optionsGrid}>
            {AD_OPTIONS.map((opt) => (
              <div key={opt.title} className={styles.optCard}>
                <span className={styles.optIcon}>{opt.icon}</span>
                <h3 className={styles.optTitle}>{opt.title}</h3>
                <p className={styles.optDesc}>{opt.desc}</p>
                <div className={styles.optPrice}>{opt.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Simple Process</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            How It <span>Works</span>
          </h2>
          <div className={styles.steps}>
            {PROCESS.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <p className={styles.stepText}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className={styles.formSection} id="enquire">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center' }}>
            Submit an <span>Enquiry</span>
          </h2>
          <p className={styles.formSub}>Fill in your details and our partnerships team will reach out within 48 hours.</p>

          {submitted ? (
            <div className={styles.successBox}>
              <FaCheckCircle className={styles.successIcon} />
              <h3>Enquiry Received!</h3>
              <p>Our partnerships team will contact you within 48 hours.</p>
              <Link to="/" className={styles.backHome}>Back to Home</Link>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Your Name <span>*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
                </div>
                <div className={styles.field}>
                  <label>Organisation / College <span>*</span></label>
                  <input name="org" value={form.org} onChange={handleChange} required placeholder="Organisation name" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Email <span>*</span></label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@org.com" />
                </div>
                <div className={styles.field}>
                  <label>Phone <span>*</span></label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Interested In</label>
                  <select name="interest" value={form.interest} onChange={handleChange}>
                    <option value="">Select ad type</option>
                    <option>Featured College Listing</option>
                    <option>Banner & Display Ads</option>
                    <option>Sponsored Content</option>
                    <option>Lead Generation</option>
                    <option>Multiple / Custom</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Monthly Budget</label>
                  <select name="budget" value={form.budget} onChange={handleChange}>
                    <option value="">Select budget range</option>
                    <option>Under ₹10,000</option>
                    <option>₹10,000 – ₹25,000</option>
                    <option>₹25,000 – ₹50,000</option>
                    <option>₹50,000+</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label>Additional Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us about your goals and target audience..." />
              </div>
              <button type="submit" className={styles.submitBtn}>Submit Enquiry</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdvertiseWithUs;
