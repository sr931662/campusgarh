import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch, FaGraduationCap, FaHandshake, FaLightbulb, FaShieldAlt,
  FaLinkedinIn, FaInstagram,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import styles from './About.module.css';
import CEO from '../assets/CEO.png'
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { parseMarkdown } from '../utils/parseMarkdown';


const STATS = [
  { value: '5,000+', label: 'Colleges Listed' },
  { value: '200+',   label: 'Courses Covered' },
  { value: '50+',    label: 'Entrance Exams' },
  { value: '10 Lac+', label: 'Students Helped' },
];

const VALUES = [
  { icon: <FaSearch />,       title: 'Transparency',           desc: 'Honest, bias-free information — no paid rankings, no hidden manipulation.' },
  { icon: <FaGraduationCap />, title: 'Student-First Approach', desc: 'Every feature is built with one goal: student welfare above everything else.' },
  { icon: <FaShieldAlt />,    title: 'Trust & Credibility',    desc: 'Verified data backed by research, official records, and ground-level reports.' },
  { icon: <FaLightbulb />,    title: 'Innovation',             desc: 'Technology-driven guidance that helps students make smarter academic decisions.' },
];

const TEAM = [
  {
    initials: 'PS',
    name: 'Priyanshu Saraswat',
    role: 'Founder & CEO',
    img: CEO,
    desc: 'Visionary behind CampusGarh — building India\'s most trusted student-first platform.',
    socials: { linkedin: '#', twitter: '#', instagram: '#' },
  },
  {
    initials: 'SK',
    name: 'Shashwat Kashyap',
    role: 'CTO',
    img: null,
    desc: 'Driving the technology that powers seamless discovery for millions of students.',
    socials: { linkedin: '#' },
  },
  // ── NEW DUMMIES ──
  {
    initials: 'RV',
    name: 'Rahul Verma',
    role: 'Lead Counselor — Engineering',
    img: null,
    desc: 'Specialist in JEE guidance and B.Tech seat allocation across IITs, NITs, and top private colleges.',
    socials: { linkedin: '#' },
  },
  {
    initials: 'AS',
    name: 'Anjali Singh',
    role: 'Head of Management Admissions',
    img: null,
    desc: 'Expert in CAT, GMAT, and MBA admissions counselling for IIMs and top B-schools across India.',
    socials: { linkedin: '#' },
  },
  {
    initials: 'KM',
    name: 'Karan Mehta',
    role: 'Legal Studies Head',
    img: null,
    desc: 'Guiding students through CLAT, CUET-Law, and admissions to top NLUs and DU Law faculty.',
    socials: { linkedin: '#' },
  },
];

const WHAT_WE_DO = [
  { icon: '🤝', title: 'Genuine College Reviews & Ground Reports', desc: 'Transparent, real-campus insights.' },
  { icon: '🔍', title: 'College Discovery & Comparison',           desc: 'Fees, placements, facilities — all verified.' },
  { icon: '💡', title: 'Career Guidance',                          desc: 'Strength-based, personality-aligned counselling.' },
  { icon: '🛡️', title: 'Trusted Counsellor Access',               desc: 'Ethical guidance with no false promises.' },
  { icon: '🎓', title: 'Digital Resources',                        desc: 'Verified lists, insights, and helpful content.' },
];

const ABOUT_FAQS = [
  { q: 'What is CampusGarh?', a: 'CampusGarh is a student-first college discovery platform providing genuine reviews, verified data, and unbiased guidance to help students make informed education decisions across India.' },
  { q: 'Is CampusGarh a consultancy or admission agency?', a: 'No. CampusGarh is not a consultancy and does not sell admissions. We provide factual, unbiased information and connect students with ethical counsellors only on demand.' },
  { q: 'Is the information on CampusGarh verified?', a: 'Yes. All college data, fees, placement stats, and exam information are sourced from official records, ground-level reports, and verified student reviews.' },
  { q: 'Is CampusGarh free to use?', a: 'Absolutely. Exploring colleges, comparing options, reading reviews, and accessing counselling support on CampusGarh is completely free for students.' },
  { q: 'Who founded CampusGarh?', a: 'CampusGarh was founded by Priyanshu Saraswat with the belief that every student deserves correct information at the right time to make confident academic choices.' },
];

const FAQSection = ({ faqs }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Frequently Asked <span>Questions</span></h2>
        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${open === i ? styles.faqOpen : ''}`}>
              <button className={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span className={styles.faqToggle}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className={styles.faqA} dangerouslySetInnerHTML={{ __html: parseMarkdown(faq.a) }} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const { data } = useQuery({
    queryKey: ['about-public'],
    queryFn: () => api.get('/about'),
    staleTime: 5 * 60 * 1000,
  });

  const d = data?.data?.data;

  // Use API data if available, fallback to hardcoded
  const stats  = d?.stats?.length  ? d.stats  : STATS;
  const values = d?.values?.length ? d.values : VALUES;
  const team   = d?.team?.length   ? d.team.map(m => ({
    ...m,
    img:     m.imgUrl || null,
    socials: { linkedin: m.linkedin || null, twitter: m.twitter || null, instagram: m.instagram || null },
  })) : TEAM;
  const ceo   = team[0];
  const staff = team.slice(1, 5);
  const faqs        = d?.faqs?.length   ? d.faqs   : ABOUT_FAQS;
  const whatWeDo    = d?.whatWeDo?.length ? d.whatWeDo : WHAT_WE_DO;

  const heroTitle   = d?.heroTitle      || "India's Most <span>Trusted</span> Student Platform";
  const heroSub     = d?.heroSubtitle   || 'CampusGarh was built with a single belief — every student deserves correct information at the right time, free of bias and free of charge.';
  const missionText = d?.missionText    || 'To empower every student with clarity, confidence, and fact-based guidance — enabling them to choose the right college and career path aligned with their potential and goals.';
  const whoWeAre    = d?.whoWeAreText   || 'CampusGarh is a modern student-support and college-discovery platform built to help learners access authentic information, genuine reviews, and ground-level reports from campuses across India.';

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Our Story</p>
          <h1 className={styles.heroTitle} dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p className={styles.heroSub}>{heroSub}</p>
          <div className={styles.heroActions}>
            <Link to="/colleges" className={styles.heroCta}>Explore Colleges</Link>
            <Link to="/contact" className={styles.heroCtaOutline}>Talk to Us</Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statBox}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className={styles.introSection}>
        <div className={styles.container}>
          <div className={styles.introGrid}>
            <div className={styles.introText}>
              <p className={styles.eyebrow}>Who We Are</p>
              <h2 className={styles.sectionTitle}>Not a consultancy. <span>A student ally.</span></h2>
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: parseMarkdown(whoWeAre) }} />
              {/* <p className={styles.body} style={{ fontStyle: 'italic', color: 'var(--muted)' }}>
                We do not sell admissions. We provide factual insights that help students make confident, well-informed decisions — without pressure or bias.
              </p> */}
            </div>
            <div className={styles.missionCard}>
              <h3>Our Mission</h3>
              <p dangerouslySetInnerHTML={{ __html: parseMarkdown(missionText) }} />

            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>What We Stand For</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Our <span>Core Values</span></h2>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className={styles.whatSection}>
        <div className={styles.container}>
          <div className={styles.whatGrid}>
            <div>
              <p className={styles.eyebrow}>What We Do</p>
              <h2 className={styles.sectionTitle}>Everything a student <span>needs</span></h2>
            </div>
            <ul className={styles.whatList}>
              {whatWeDo.map((item, i) => (
                <li key={i}>
                  <span className={styles.whatIcon}>{item.icon}</span>
                  <div><strong>{item.title}</strong><span>{item.desc}</span></div>
                </li>
              ))}
            </ul>

          </div>
        </div>
      </section>

            {/* ── TEAM ── */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <p className={styles.eyebrow} style={{ textAlign: 'center' }}>The People Behind It</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>Meet the <span>Team</span></h2>

          {ceo && (
            <div className={styles.ceoCard}>
              <div className={styles.ceoPhotoWrap}>
                {ceo.img
                  ? <img src={ceo.img} alt={ceo.name} className={styles.ceoPhoto} />
                  : <div className={styles.ceoAvatar}>{ceo.initials}</div>
                }
              </div>
              <div className={styles.ceoBody}>
                <div className={styles.ceoRole}>{ceo.role}</div>
                <div className={styles.ceoName}>{ceo.name}</div>
                {ceo.desc && <p className={styles.ceoThought}>"{ceo.desc}"</p>}
                <div className={styles.ceoSocials}>
                  {ceo.socials?.instagram && <a href={ceo.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>}
                  {ceo.socials?.linkedin  && <a href={ceo.socials.linkedin}  target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>}
                  {ceo.socials?.twitter   && <a href={ceo.socials.twitter}   target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><FaXTwitter /></a>}
                </div>
              </div>
            </div>
          )}

          {staff.length > 0 && (
            <div className={styles.teamGrid}>
              {staff.map((m) => (
                <div key={m.name} className={styles.teamCard}>
                  <div className={styles.teamPhotoWrap}>
                    {m.img
                      ? <img src={m.img} alt={m.name} className={styles.teamPhoto} />
                      : <div className={styles.avatar}>{m.initials}</div>
                    }
                  </div>
                  <div className={styles.teamCardBody}>
                    <div className={styles.teamName}>{m.name}</div>
                    <div className={styles.teamRole}>{m.role}</div>
                    <p className={styles.teamDesc}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className={styles.teamNote}>
            CampusGarh was created with the belief that every student deserves correct information at the right time.
          </p>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <p className={styles.eyebrow}>Start Today — It's Free</p>
            <h2 className={styles.ctaTitle}>Ready to find your college?</h2>
            <p className={styles.ctaBody}>Explore thousands of colleges, compare options, and get free counselling — all in one place.</p>
            <div className={styles.ctaActions}>
              <Link to="/colleges" className={styles.heroCta}>Explore Colleges →</Link>
              <Link to="/contact" className={styles.heroCtaOutline}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} />
    </div>
  );
};

export default About;
