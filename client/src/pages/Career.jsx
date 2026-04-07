import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLaptopCode, FaBullhorn, FaUserGraduate, FaChartBar, FaPen, FaHandshake } from 'react-icons/fa';
import styles from './Career.module.css';

const PERKS = [
  { icon: <FaLaptopCode />, title: 'Remote-Friendly', desc: 'Work from anywhere in India. We believe in outcomes, not office hours.' },
  { icon: <FaUserGraduate />, title: 'Learn & Grow', desc: 'Access to courses, conferences, and a dedicated learning budget.' },
  { icon: <FaChartBar />, title: 'Real Impact', desc: 'Every line of code, article, or call helps a student make a better decision.' },
  { icon: <FaHandshake />, title: 'Great Culture', desc: 'A small, ambitious team that is honest, supportive, and moves fast.' },
];

const OPENINGS = [
  {
    title: 'Full-Stack Developer',
    dept: 'Engineering',
    type: 'Full-time · Remote',
    desc: 'Build features that millions of students use daily. React, Node.js, MongoDB stack.',
  },
  {
    title: 'Content Writer – Education',
    dept: 'Content',
    type: 'Full-time · Remote',
    desc: 'Write accurate, engaging guides on colleges, courses, and entrance exams across India.',
  },
  {
    title: 'SEO & Growth Analyst',
    dept: 'Marketing',
    type: 'Full-time · Remote',
    desc: 'Drive organic growth through data-driven SEO strategies for an education platform.',
  },
  {
    title: 'Student Counsellor',
    dept: 'Counselling',
    type: 'Part-time / Contract',
    desc: 'Guide students through college choices. Earn per session. Flexible schedule.',
  },
  {
    title: 'UI/UX Designer',
    dept: 'Design',
    type: 'Full-time · Remote',
    desc: 'Design beautiful, accessible experiences for students exploring colleges and exams.',
  },
  {
    title: 'College Partnerships Manager',
    dept: 'Business Development',
    type: 'Full-time · India',
    desc: 'Build and manage relationships with colleges, institutes, and counselling centers.',
  },
];

const Career = () => {
  const [applied, setApplied] = useState({});

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Join Us</p>
          <h1 className={styles.heroTitle}>Build the Future of <span>Education</span></h1>
          <p className={styles.heroSub}>
            CampusGarh is on a mission to help every Indian student make the right college choice.
            We're looking for passionate people to join us.
          </p>
          <a href="#openings" className={styles.heroCta}>See Open Roles</a>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={styles.perksSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Why CampusGarh</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Work that <span>matters</span>
          </h2>
          <div className={styles.perksGrid}>
            {PERKS.map((p) => (
              <div key={p.title} className={styles.perkCard}>
                <span className={styles.perkIcon}>{p.icon}</span>
                <h3 className={styles.perkTitle}>{p.title}</h3>
                <p className={styles.perkDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPENINGS ── */}
      <section className={styles.openingsSection} id="openings">
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>Current Openings</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Open <span>Roles</span>
          </h2>
          <div className={styles.openingsList}>
            {OPENINGS.map((job) => (
              <div key={job.title} className={styles.jobCard}>
                <div className={styles.jobLeft}>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobDept}>{job.dept}</span>
                    <span className={styles.jobType}>{job.type}</span>
                  </div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobDesc}>{job.desc}</p>
                </div>
                <button
                  className={`${styles.applyBtn} ${applied[job.title] ? styles.applyBtnDone : ''}`}
                  onClick={() => setApplied(a => ({ ...a, [job.title]: true }))}
                >
                  {applied[job.title] ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.noRole}>
            <p>Don't see a role that fits? We'd still love to hear from you.</p>
            <Link to="/contact" className={styles.contactLink}>Send us your profile →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <p className={styles.eyebrow}>Open to Collaboration</p>
            <h2 className={styles.ctaTitle}>Not hiring for your role yet?</h2>
            <p className={styles.ctaBody}>
              We're always open to meeting talented writers, developers, counsellors, and educators. Drop us a line.
            </p>
            <Link to="/contact" className={styles.heroCta}>Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Career;
