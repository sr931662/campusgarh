import React from 'react';
import styles from './MeetCounselors.module.css';

const counselors = [
  { name: 'Priya Sharma', role: 'Engineering & MBA Specialist', exp: '7 yrs', img: null },
  { name: 'Rahul Verma', role: 'Medical Admissions Expert', exp: '5 yrs', img: null },
  { name: 'Anjali Singh', role: 'Study Abroad Counselor', exp: '6 yrs', img: null },
  { name: 'Karan Mehta', role: 'Law & Arts Guidance', exp: '4 yrs', img: null },
];

const MeetCounselors = () => (
  <section className={styles.section}>
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Expert Guidance</p>
        <h2 className={styles.heading}>Meet Our <span>Counselors</span></h2>
        <p className={styles.sub}>Real people, real advice — our counselors have helped thousands of students find their path.</p>
      </div>
      <div className={styles.grid}>
        {counselors.map((c) => (
          <div key={c.name} className={styles.card}>
            <div className={styles.avatar}>{c.name[0]}</div>
            <h3 className={styles.name}>{c.name}</h3>
            <p className={styles.role}>{c.role}</p>
            <span className={styles.exp}>{c.exp} experience</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MeetCounselors;
