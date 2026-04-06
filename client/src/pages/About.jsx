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

const ABOUT_FAQS = [
  { q: 'What is CampusGarh?', a: 'CampusGarh is a student-first college discovery platform providing genuine reviews, verified data, and unbiased guidance to help students make informed education decisions across India.' },
  { q: 'Is CampusGarh a consultancy or admission agency?', a: 'No. CampusGarh is not a consultancy and does not sell admissions. We provide factual, unbiased information and connect students with ethical counsellors only on demand.' },
  { q: 'Is the information on CampusGarh verified?', a: 'Yes. All college data, fees, placement stats, and exam information are sourced from official records, ground-level reports, and verified student reviews.' },
  { q: 'Is CampusGarh free to use?', a: 'Absolutely. Exploring colleges, comparing options, reading reviews, and accessing counselling support on CampusGarh is completely free for students.' },
  { q: 'Who founded CampusGarh?', a: 'CampusGarh was founded by Priyanshu Saraswat with the belief that every student deserves correct information at the right time to make confident academic choices.' },
];

const VALUES = [
  {
    icon: '🔍',
    title: 'Transparency',
    desc: 'Honest, bias-free information — no paid rankings, no hidden manipulation.',
  },
  {
    icon: '🎓',
    title: 'Student-First Approach',
    desc: 'Every feature is built with one goal: student welfare above everything else.',
  },
  {
    icon: '✅',
    title: 'Trust & Credibility',
    desc: 'Verified data backed by research, official records, and ground-level reports.',
  },
  {
    icon: '💡',
    title: 'Innovation',
    desc: 'Technology-driven guidance that helps students make smarter academic decisions.',
  },
];

const FAQSection = ({ faqs }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', padding: '1rem 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.97rem', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            {faq.q}
            <span>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <p style={{ padding: '0 0 1rem', color: '#4b5563', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

const TEAM = [
  { initials: 'PS', name: 'Priyanshu Saraswat', role: 'Founder & CEO' },
  { initials: 'SK', name: 'Shashwat Kashyap', role: 'CTO' },
];

const About = () => {
  return (
    <div className={styles.container}>
      {/* ── HERO ── */}
      <div className={styles.hero}>
        <h1>About CampusGarh</h1>
        <p>Your gateway to the right campus — helping students find the right campus.</p>
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

      {/* ── INTRO ── */}
      <div className={styles.content}>
        <Card padding="lg" className={styles.card}>
          <h2>Who We Are</h2>
          <p>
            CampusGarh is a modern student-support and college-discovery platform built to help learners
            access authentic information, genuine reviews, and ground-level reports from campuses across India.
          </p>
          <p style={{ marginTop: '0.75rem', fontStyle: 'italic', color: '#6b7280' }}>
            CampusGarh is not a consultancy. We do not sell admissions. We provide factual insights
            that help students make confident, well-informed academic decisions — without pressure or bias.
          </p>
        </Card>

        <Card padding="lg" className={styles.card}>
          <h2>Our Mission</h2>
          <p>
            To empower every student with clarity, confidence, and fact-based guidance — enabling them
            to choose the right college and career path aligned with their potential and goals.
          </p>
        </Card>
      </div>

      {/* ── WHAT WE DO ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>What We Do</h2>
        <div className={styles.content}>
          <Card padding="lg" className={styles.card}>
            <ul>
              <li><strong>Genuine College Reviews & Ground Reports:</strong> Transparent, real-campus insights.</li>
              <li><strong>College Discovery & Comparison:</strong> Courses, fees, placements, facilities — verified data.</li>
              <li><strong>Career Guidance:</strong> Understanding personality, ability, strengths, and opportunities.</li>
              <li><strong>Documentation Support (Optional):</strong> Help with forms only if students request it.</li>
              <li><strong>Trusted Counsellor Access:</strong> Ethical guidance with no false promises.</li>
              <li><strong>Digital Resources:</strong> Verified lists, insights, and helpful content for students.</li>
            </ul>
          </Card>
        </div>
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

      {/* ── WHY STUDENTS TRUST US ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Students Trust Us</h2>
        <div className={styles.content}>
          <Card padding="lg" className={styles.card}>
            <ul>
              <li>Genuine college reviews and honest ground reports</li>
              <li>Unbiased information without sales pressure</li>
              <li>Access to ethical counsellors only on demand</li>
              <li>Support from exploration to final decision-making</li>
              <li>A transparent, student-first platform</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ── FOUNDER ── */}
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
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b7280', maxWidth: '600px', margin: '1.5rem auto 0' }}>
          CampusGarh was created with the belief that every student deserves correct information at the right time.
          The vision is to build India's most trusted student-first ecosystem powered by real experiences and modern technology.
        </p>
      </div>

      {/* ── FUTURE GOAL ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Future Goal</h2>
        <div className={styles.content}>
          <Card padding="lg" className={styles.card}>
            <p>
              To expand into a nationwide student ecosystem, offering accurate educational insights to millions
              and becoming India's most reliable college-discovery platform.
            </p>
          </Card>
        </div>
      </div>

      {/* ── MESSAGE ── */}
      <div className={styles.section}>
        <div className={styles.content}>
          <Card padding="lg" className={styles.card} style={{ textAlign: 'center' }}>
            <h2>A Message for Students</h2>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>
              "Your journey matters. Your decisions matter. CampusGarh is here to support you
              with truth, clarity, and reliable guidance — every step of the way."
            </p>
          </Card>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className={styles.ctaStrip}>
        <h2>Ready to find your college?</h2>
        <p>Explore thousands of colleges, compare options, and get free counselling — all in one place.</p>
        <Link to="/colleges" className={styles.ctaBtn}>Explore Colleges →</Link>
      </div>
      <FAQSection faqs={ABOUT_FAQS} />
    </div>
  );
};

export default About;
