import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaLinkedinIn, FaTwitter, FaInstagram } from 'react-icons/fa';
import api from '../../services/api';
import styles from './MeetCounselors.module.css';

const FALLBACK = [
  { name: 'Priya Sharma',  role: 'Engineering & MBA Specialist', exp: '7 yrs', img: null, desc: 'Guided 500+ students into top IITs, NITs & IIMs with personalized strategies.', linkedin: '#', twitter: '#' },
  { name: 'Rahul Verma',   role: 'Medical Admissions Expert',    exp: '5 yrs', img: null, desc: 'Specialist in NEET counselling and MBBS/BDS seat allocation across India.',    linkedin: '#', instagram: '#' },
  { name: 'Anjali Singh',  role: 'Study Abroad Counselor',       exp: '6 yrs', img: null, desc: 'Helped 300+ students secure admissions and scholarships at global universities.', linkedin: '#', twitter: '#' },
  { name: 'Karan Mehta',   role: 'Law & Arts Guidance',          exp: '4 yrs', img: null, desc: 'Expert in CLAT, CUET, and humanities stream counselling for NLUs and DU.',    linkedin: '#' },
];

const MeetCounselors = () => {
  const { data } = useQuery({
    queryKey: ['counselors-public'],
    queryFn: () => api.get('/counselors'),
    staleTime: 10 * 60 * 1000,
  });

  const raw = data?.data?.data;
  const list = Array.isArray(raw) && raw.length > 0
    ? raw.map(c => ({ name: c.name, role: c.role, exp: c.exp, img: c.imgUrl || null, desc: c.desc, linkedin: c.linkedin, twitter: c.twitter, instagram: c.instagram }))
    : FALLBACK;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Expert Guidance</p>
          <h2 className={styles.heading}>Meet Our <span>Counselors</span></h2>
          <p className={styles.sub}>Real people, real advice — our counselors have helped thousands of students find their path.</p>
        </div>
        <div className={styles.grid}>
          {list.map((c) => (
            <div key={c.name} className={styles.card}>
              <div className={styles.avatarWrap}>
                {c.img
                  ? <img src={c.img} alt={c.name} className={styles.avatarImg} />
                  : <div className={styles.avatar}>{c.name[0]}</div>
                }
              </div>
              <h3 className={styles.name}>{c.name}</h3>
              <p className={styles.role}>{c.role}</p>
              <p className={styles.desc}>{c.desc}</p>
              <span className={styles.exp}>{c.exp} experience</span>
              <div className={styles.socials}>
                {c.linkedin  && <a href={c.linkedin}  target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>}
                {c.twitter   && <a href={c.twitter}   target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>}
                {c.instagram && <a href={c.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetCounselors;
