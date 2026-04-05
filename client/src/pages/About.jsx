import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card/Card';
import styles from './About.module.css';

const STATS = [
  { value: '5,000+', label: 'Colleges Listed' },
  { value: '200+',   label: 'Courses Covered' },
  { value: '50+',    label: 'Entrance Exams'  },
  { value: '10 Lac+', label: 'Students Helped' },
];

const VALUES = [
  {
    icon: '🔍',
    title: 'Transparency',
    desc: 'We publish honest, verified data — no paid rankings, no hidden bias.',
  },
  {
    icon: '✅',
    title: 'Accuracy',
    desc: 'Every college, fee, and placement stat is sourced from official records and student reviews.',
  },
  {
    icon: '🎓',
    title: 'Student-First',
    desc: "Our decisions are guided by one question: does this help the student make a better choice?",
  },
];

const TEAM = [
  { initials: 'AK', name: 'Arjun Kumar',   role: 'Founder & CEO'        },
  { initials: 'PS', name: 'Priya Sharma',   role: 'Head of Product'      },
  { initials: 'RV', name: 'Rahul Verma',    role: 'Tech Lead'            },
  { initials: 'SM', name: 'Sneha Mehta',    role: 'Student Counsellor'   },
];

const About = () => {
  return (
    <div className={styles.container}>
      {/* ── HERO ── */}
      <div className={styles.hero}>
        <h1>About CampusGarh</h1>
        <p>Empowering students to make informed education decisions</p>
      </div>

      {/* ── STATS ── */}
      <div className={styles.statsRow}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statBox}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── MISSION ── */}
      <div className={styles.content}>
        <Card padding="lg" className={styles.card}>
          <h2>Our Mission</h2>
          <p>
            CampusGarh is dedicated to helping students discover the right college and course for their future.
            We provide transparent, verified information and personalized guidance to make education choices easier.
          </p>
        </Card>

        <Card padding="lg" className={styles.card}>
          <h2>What We Offer</h2>
          <ul>
            <li>Comprehensive college and course database</li>
            <li>Student reviews and ratings</li>
            <li>Entrance exam information and updates</li>
            <li>Expert counselling support</li>
            <li>College comparison tools</li>
          </ul>
        </Card>
      </div>

      {/* ── VALUES ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>What We Stand For</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map((v) => (
            <div key={v.title} className={styles.valueCard}>
              <div className={styles.valueIcon}>{v.icon}</div>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueDesc}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Meet the Team</h2>
        <div className={styles.teamGrid}>
          {TEAM.map((m) => (
            <div key={m.name} className={styles.teamCard}>
              <div className={styles.avatar}>{m.initials}</div>
              <div className={styles.teamName}>{m.name}</div>
              <div className={styles.teamRole}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className={styles.ctaStrip}>
        <h2>Ready to find your college?</h2>
        <p>Explore thousands of colleges, compare options, and get free counselling — all in one place.</p>
        <Link to="/colleges" className={styles.ctaBtn}>Explore Colleges →</Link>
      </div>
    </div>
  );
};

export default About;
