import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import styles from './Footer.module.css';
import logo from "../../../assets/Campus white color logo png-01.png";
import { useFeaturedColleges, useCourses, useExams } from '../../../hooks/queries';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const { data: fcData } = useFeaturedColleges({ limit: 6 });
  const fcRaw = fcData?.data?.data;
  const footerColleges = Array.isArray(fcRaw) ? fcRaw : Array.isArray(fcRaw?.data) ? fcRaw.data : [];

  const { data: crData } = useCourses({ limit: 6 });
  const crRaw = crData?.data?.data;
  const footerCourses = Array.isArray(crRaw) ? crRaw : Array.isArray(crRaw?.data) ? crRaw.data : [];

  const { data: exData } = useExams({ limit: 6 });
  const exRaw = exData?.data?.data;
  const footerExams = Array.isArray(exRaw) ? exRaw : Array.isArray(exRaw?.data) ? exRaw.data : [];

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
              {footerColleges.length > 0
                ? footerColleges.map(c => <li key={c._id}><Link to={`/colleges/${c.slug}`}>{c.shortName || c.name}</Link></li>)
                : <>
                    <li><Link to="/colleges?type=Engineering%20%26%20Technology">Engineering Colleges</Link></li>
                    <li><Link to="/colleges?type=Medical%20%26%20Health%20Sciences">Medical Colleges</Link></li>
                    <li><Link to="/colleges?type=Management%20%26%20Business">Management Colleges</Link></li>
                  </>}
            </ul>
          </div>


          {/* Top Exams */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Top Exams</h4>
            <ul className={styles.links}>
              {footerExams.length > 0
                ? footerExams.map(e => <li key={e._id}><Link to={`/exams/${e.slug}`}>{e.name}</Link></li>)
                : <>
                    <li><Link to="/exams?category=UG">JEE Main</Link></li>
                    <li><Link to="/exams?category=UG">NEET UG</Link></li>
                    <li><Link to="/exams?category=PG">CAT</Link></li>
                  </>}
            </ul>
          </div>


          {/* Top Courses */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Top Courses</h4>
            <ul className={styles.links}>
              {footerCourses.length > 0
                ? footerCourses.map(c => <li key={c._id}><Link to={`/courses/${c.slug}`}>{c.name}</Link></li>)
                : <>
                    <li><Link to="/courses?discipline=Engineering%20%26%20Technology">B.Tech</Link></li>
                    <li><Link to="/courses?discipline=Medical%20%26%20Health%20Sciences">MBBS</Link></li>
                    <li><Link to="/courses?discipline=Management%20%26%20Business">MBA</Link></li>
                  </>}
            </ul>
          </div>


          {/* Useful Links */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>Useful Links</h4>
            <ul className={styles.links}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
              <li><Link to="/compare">College Compare</Link></li>
            </ul>
          </div>

          {/* News & Articles */}
          <div className={styles.section}>
            <h4 className={styles.subtitle}>News & Articles</h4>
            <ul className={styles.links}>
              <li><Link to="/blogs?category=admission">Admission Guide</Link></li>
              <li><Link to="/blogs?category=exam-prep">Exam Preparation</Link></li>
              <li><Link to="/blogs?category=career">Career Advice</Link></li>
              <li><Link to="/blogs?category=scholarship">Scholarships</Link></li>
              <li><Link to="/blogs">All Articles</Link></li>
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
            <Link to="/contact">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
