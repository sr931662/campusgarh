import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter, FaYoutube, FaThreads } from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import styles from './Footer.module.css';
import logo from "../../../assets/Campus white color logo png-01.png";
import { useFeaturedColleges, useCourses, useExams, useFeaturedLinks } from '../../../hooks/queries';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const { data: fcData } = useFeaturedColleges({ limit: 6 });
  const fcRaw = fcData?.data?.data;
  const footerColleges = Array.isArray(fcRaw) ? fcRaw : Array.isArray(fcRaw?.data) ? fcRaw.data : [];

  const { data: crData } = useCourses({ limit: 6 });
  const crRaw = crData?.data?.data;
  const footerCourses = Array.isArray(crRaw) ? crRaw : Array.isArray(crRaw?.data) ? crRaw.data : [];

  const { data: exData } = useExams({ limit: 6 });
  const exRaw = exData?.data?.data;
  const footerExams = Array.isArray(exRaw) ? exRaw : Array.isArray(exRaw?.data) ? exRaw.data : [];

  const { data: flData } = useFeaturedLinks();
  const flRaw = flData?.data?.data;
  const featuredLinks = Array.isArray(flRaw) ? flRaw : [];

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

      {/* ── Social Strip ── */}
      <div className={styles.socialStrip}>
        <div className={styles.socialStripInner}>
          <Link to="/" className={styles.logoLink}>
            <img src={logo} alt="CampusGarh" className={styles.logo} />
          </Link>
          <p className={styles.socialStripTagline}>Your trusted partner in education discovery and admission guidance across India.</p>
          <div className={styles.socialStripLinks}>
            <a href="https://www.facebook.com/campusgarh" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /><span>Facebook</span></a>
            <a href="https://www.instagram.com/campusgarh/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /><span>Instagram</span></a>
            <a href="https://www.linkedin.com/company/campusgarh/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /><span>LinkedIn</span></a>
            <a href="https://x.com/campusgarh" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><FaXTwitter /><span>X (Twitter)</span></a>
            <a href="https://www.youtube.com/channel/UCWXPo6OYZGfXJEfhKsmgdQQ" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /><span>YouTube</span></a>
            <a href="https://www.threads.com/@campusgarh" target="_blank" rel="noopener noreferrer" aria-label="Threads"><FaThreads /><span>Threads</span></a>
          </div>
        </div>
      </div>

      {/* ── Newsletter Strip ── */}
      <div className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <div className={styles.newsletterText}>
            <h3 className={styles.newsletterTitle}>Stay in the loop</h3>
            <p className={styles.newsletterSub}>Exam alerts, admission deadlines &amp; college news — straight to your inbox.</p>
          </div>
          <div className={styles.newsletterRight}>
            <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
              <div className={styles.inputWrap}>
                <MdEmail className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="your@email.com"
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
                {status === 'loading' ? 'Subscribing…' : status === 'success' ? '✓ Subscribed' : 'Subscribe'}
              </button>
            </form>
            {status === 'error' && <p className={styles.errorMsg}>Something went wrong. Try again.</p>}
          </div>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div className={styles.container}>
        <div className={`${styles.grid} ${featuredLinks.length > 0 ? styles.gridWithFeatured : ''}`}>

          {/* Brand Column */}
          {/* <div className={styles.brand}>
            <Link to="/" className={styles.logoLink}>
              <img src={logo} alt="CampusGarh" className={styles.logo} />
            </Link>
            <p className={styles.tagline}>
              Your trusted partner in education discovery and admission guidance across India.
            </p>
            <div className={styles.social}>
              <a href="https://www.facebook.com/campusgarh" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://x.com/campusgarh" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><FaXTwitter /></a>
              <a href="https://www.linkedin.com/company/campusgarh/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://www.instagram.com/campusgarh/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCWXPo6OYZGfXJEfhKsmgdQQ" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div> */}

          {/* Top Colleges */}
          <div className={styles.col}>
            <h4 className={styles.colHead}>Top Colleges</h4>
            <ul className={styles.colLinks}>
              {footerColleges.length > 0
                ? footerColleges.map(c => (
                    <li key={c._id}><Link to={`/colleges/${c.slug}`}>{c.shortName || c.name}</Link></li>
                  ))
                : <>
                    <li><Link to="/colleges?type=Engineering%20%26%20Technology">Engineering</Link></li>
                    <li><Link to="/colleges?type=Medical%20%26%20Health%20Sciences">Medical</Link></li>
                    <li><Link to="/colleges?type=Management%20%26%20Business">Management</Link></li>
                    <li><Link to="/colleges?type=Law">Law</Link></li>
                    <li><Link to="/colleges">All Colleges</Link></li>
                  </>}
            </ul>
          </div>

          {/* Top Exams */}
          <div className={styles.col}>
            <h4 className={styles.colHead}>Top Exams</h4>
            <ul className={styles.colLinks}>
              {footerExams.length > 0
                ? footerExams.map(e => (
                    <li key={e._id}><Link to={`/exams/${e.slug}`}>{e.name}</Link></li>
                  ))
                : <>
                    <li><Link to="/exams?category=UG">JEE Main</Link></li>
                    <li><Link to="/exams?category=UG">NEET UG</Link></li>
                    <li><Link to="/exams?category=PG">CAT</Link></li>
                    <li><Link to="/exams?category=PG">GATE</Link></li>
                    <li><Link to="/exams">All Exams</Link></li>
                  </>
              }
            </ul>
          </div>

          {/* Top Courses */}
          <div className={styles.col}>
            <h4 className={styles.colHead}>Top Courses</h4>
            <ul className={styles.colLinks}>
              {footerCourses.length > 0
                ? footerCourses.map(c => (
                    <li key={c._id}><Link to={`/courses/${c.slug}`}>{c.name}</Link></li>
                  ))
                : <>
                    <li><Link to="/courses?discipline=Engineering%20%26%20Technology">B.Tech</Link></li>
                    <li><Link to="/courses?discipline=Medical%20%26%20Health%20Sciences">MBBS</Link></li>
                    <li><Link to="/courses?discipline=Management%20%26%20Business">MBA</Link></li>
                    <li><Link to="/courses?discipline=Law">LLB</Link></li>
                    <li><Link to="/courses">All Courses</Link></li>
                  </>}
            </ul>
          </div>

          {/* Featured Links — only when admin has added some */}
          {featuredLinks.length > 0 && (
            <div className={styles.col}>
              <h4 className={styles.colHead}>Featured Links</h4>
              <ul className={styles.colLinks}>
                {featuredLinks.map(l => (
                  <li key={l._id}>
                    {l.openInNewTab
                      ? <a href={l.url} target="_blank" rel="noopener noreferrer">{l.title}</a>
                      : <Link to={l.url}>{l.title}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Links */}
          <div className={styles.col}>
            <h4 className={styles.colHead}>Quick Links</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/blogs">Articles &amp; News</Link></li>
              <li><Link to="/compare">Compare Colleges</Link></li>
              <li><Link to="/predictor">College Predictor</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/partner">Partner with Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/advertise">Advertise with Us</Link></li>
            </ul>
          </div>


        </div>

        {/* ── Stats Bar ── */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statNum}>500+</span>
            <span className={styles.statLbl}>Colleges Listed</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>10K+</span>
            <span className={styles.statLbl}>Student Reviews</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>1M+</span>
            <span className={styles.statLbl}>Students Helped</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>100+</span>
            <span className={styles.statLbl}>Exams Covered</span>
          </div>
        </div>

        {/* ── Copyright ── */}
          <div className={styles.copyright}>
            <p>© {currentYear} CampusGarh Pvt. Ltd. All rights reserved.</p>
            <p>Made with love by <strong>Pinaqtech</strong></p>
            <div className={styles.legalLinks}>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-and-conditions">Terms</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/about">About</Link>
            </div>
          </div>



      </div>
    </footer>
  );
};

export default Footer;
