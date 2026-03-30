import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import styles from './Footer.module.css';
import logo from "../../../assets/Campus white color logo png-01.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className={styles.footer}>

      {/* Newsletter Strip */}
      <div className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div>
            <h3 className={styles.newsletterTitle}>Stay Updated!</h3>
            <p className={styles.newsletterSub}>Get latest updates on exams, admissions, and college news</p>
          </div>
          <div className={styles.newsletterRight}>
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <div className={styles.inputWrap}>
                <MdEmail className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  className={styles.emailInput}
                  disabled={status === 'loading' || status === 'success'}
                />
              </div>
              <button
                type="submit"
                className={styles.subscribeBtn}
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? 'Subscribing…' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {status === 'error' && (
              <p className={styles.errorMsg}>Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.container}>

        {/* Main Grid */}
        <div className={styles.grid}>

          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/">
              <img src={logo} alt="CampusGarh" className={styles.footerLogoIcon} />
            </Link>
            <p className={styles.description}>
              Your trusted partner in education discovery and admission guidance across India.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="X / Twitter"><FaXTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          {/* Top Colleges */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Top Colleges</h4>
            <ul className={styles.links}>
              <li><Link to="/colleges?type=engineering">Engineering Colleges</Link></li>
              <li><Link to="/colleges?type=medical">Medical Colleges</Link></li>
              <li><Link to="/colleges?type=management">Management Colleges</Link></li>
              <li><Link to="/colleges?type=law">Law Colleges</Link></li>
              <li><Link to="/colleges?type=arts">Arts Colleges</Link></li>
              <li><Link to="/colleges?type=science">Science Colleges</Link></li>
            </ul>
          </div>

          {/* Top Exams */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Top Exams</h4>
            <ul className={styles.links}>
              <li><Link to="/exams/jee-main">JEE Main</Link></li>
              <li><Link to="/exams/neet-ug">NEET UG</Link></li>
              <li><Link to="/exams/cat">CAT</Link></li>
              <li><Link to="/exams/gate">GATE</Link></li>
              <li><Link to="/exams/clat">CLAT</Link></li>
              <li><Link to="/exams/cuet">CUET</Link></li>
            </ul>
          </div>

          {/* Top Courses */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Top Courses</h4>
            <ul className={styles.links}>
              <li><Link to="/courses/btech">B.Tech</Link></li>
              <li><Link to="/courses/mbbs">MBBS</Link></li>
              <li><Link to="/courses/mba">MBA</Link></li>
              <li><Link to="/courses/llb">LLB</Link></li>
              <li><Link to="/courses/bsc">B.Sc</Link></li>
              <li><Link to="/courses/bba">BBA</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Useful Links</h4>
            <ul className={styles.links}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Tools</h4>
            <ul className={styles.links}>
              <li><Link to="/college-predictor">College Predictor</Link></li>
              <li><Link to="/compare">College Compare</Link></li>
              <li><Link to="/cutoff-predictor">Cutoff Predictor</Link></li>
              <li><Link to="/rank-predictor">Rank Predictor</Link></li>
              <li><Link to="/counselling">Counselling</Link></li>
              <li><Link to="/scholarships">Scholarship Finder</Link></li>
            </ul>
          </div>

        </div>

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>500+</span>
            <span className={styles.statLabel}>Colleges</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>10K+</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>1M+</span>
            <span className={styles.statLabel}>Students Helped</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNumber}>100+</span>
            <span className={styles.statLabel}>Exams Covered</span>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p>&copy; {currentYear} CampusGarh. All rights reserved.</p>
          <div className={styles.copyrightLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer">Sitemap</a>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
