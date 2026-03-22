import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter, FaYoutube } from 'react-icons/fa6';
import styles from './Footer.module.css';
// import logo_on_light from "../../../assets/Campus png transparent-01.png"
import logo from "../../../assets/Campus white color logo png-01.png"

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.section}>
            <Link to="/" className={styles.footerLogo}>
              <img src={logo} alt="CampusGarh" className={styles.footerLogoIcon} />
            </Link>
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
              <a href="#" aria-label="Facebook" className={styles.socialIcon}><FaFacebook /></a>
              <a href="#" aria-label="X / Twitter" className={styles.socialIcon}><FaXTwitter /></a>
              <a href="#" aria-label="LinkedIn" className={styles.socialIcon}><FaLinkedinIn /></a>
              <a href="#" aria-label="Instagram" className={styles.socialIcon}><FaInstagram /></a>
              <a href="#" aria-label="YouTube" className={styles.socialIcon}><FaYoutube /></a>
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