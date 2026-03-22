import React from 'react';
import Card from '../components/common/Card/Card';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>About CampusGarh</h1>
        <p>Empowering students to make informed education decisions</p>
      </div>
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
        <Card padding="lg" className={styles.card}>
          <h2>Our Team</h2>
          <p>
            We are a passionate team of educators, technologists, and career advisors committed to transforming
            the education discovery landscape in India.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default About;