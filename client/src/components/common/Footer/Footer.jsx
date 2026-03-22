import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.section}>
            <h3 className={styles.title}>Campus<em>Garh</em></h3>
            <p className={styles.description}>
              Your trusted partner in education discovery and admission guidance across India.
            </p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>Quick Links</h4>
            <ul className={styles.links}>
              <li><Link to="/colleges">Colleges</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/exams">Exams</Link></li>
              <li><Link to="/blogs">Blog</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>Support</h4>
            <ul className={styles.links}>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.subtitle}>Connect</h4>
            <div className={styles.social}>
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="LinkedIn">🔗</a>
              <a href="#" aria-label="Instagram">📷</a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {currentYear} CampusGarh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;