import React, { useState } from 'react';
import styles from './StaticPage.module.css';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using CampusGarh ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use our platform.

These terms apply to all visitors, registered users, and anyone who accesses or uses any part of the platform.`,
  },
  {
    title: '2. Platform Description',
    content: `CampusGarh is an educational discovery platform that provides:

• Information about colleges, courses, and entrance exams in India
• Student reviews and ground-level reports from verified users
• College comparison and shortlisting tools
• Free access to ethical counsellors upon request
• News, guides, and articles for students and parents

CampusGarh is not an admission agency, consultancy, or college representative. We do not guarantee admissions or charge students for information access.`,
  },
  {
    title: '3. User Accounts',
    content: `When you create an account on CampusGarh:

• You must provide accurate, current, and complete information
• You are responsible for maintaining the confidentiality of your password
• You must notify us immediately of any unauthorised use of your account
• You may not use another person's account without permission
• We reserve the right to suspend or terminate accounts that violate these terms

You must be at least 13 years of age to create an account.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to:

• Use the platform for any unlawful purpose
• Post false, misleading, or defamatory reviews
• Impersonate any person or entity
• Attempt to gain unauthorised access to any part of the platform
• Use automated tools to scrape or extract data without permission
• Spam, harass, or abuse other users or our team
• Submit plagiarised content, false credentials, or fake information

Violation of these terms may result in immediate account suspension.`,
  },
  {
    title: '5. Content & Reviews',
    content: `User-submitted content (reviews, queries, comments) on CampusGarh:

• Must be genuine, based on personal experience, and factually accurate
• Must not contain abusive language, hate speech, or personal attacks
• Must not disclose confidential institutional information without permission
• May be moderated or removed if it violates our community guidelines

By submitting content, you grant CampusGarh a non-exclusive, royalty-free licence to use, display, and distribute that content on the platform.`,
  },
  {
    title: '6. Intellectual Property',
    content: `All content on CampusGarh — including text, graphics, logos, icons, images, audio clips, and software — is the property of CampusGarh or its content suppliers and is protected by Indian and international intellectual property laws.

You may not reproduce, distribute, or create derivative works from our content without express written permission.`,
  },
  {
    title: '7. Third-Party Links & Services',
    content: `CampusGarh may link to external websites, college portals, and exam boards for reference. We do not endorse or control these sites and are not responsible for their content, accuracy, or privacy practices.

Links are provided as a convenience. Accessing them is at your own risk.`,
  },
  {
    title: '8. Disclaimer of Warranties',
    content: `CampusGarh provides the platform "as is" and "as available" without warranties of any kind — express or implied. We do not guarantee:

• The accuracy, completeness, or timeliness of college/exam data
• Admission outcomes or counsellor recommendations
• Uninterrupted or error-free access to the platform

Data is sourced from official records and verified reports but may not reflect real-time changes made by institutions.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the fullest extent permitted by law, CampusGarh shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of — or inability to use — the platform, including reliance on any information provided.

Our total liability to you for any claim shall not exceed ₹500.`,
  },
  {
    title: '10. Modifications to Terms',
    content: `We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of CampusGarh after any modification constitutes acceptance of the updated terms.

We will notify registered users of material changes via email.`,
  },
  {
    title: '11. Governing Law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in India.`,
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms, contact us at:

Email: legal@campusgarh.com
Address: CampusGarh, India`,
  },
];

const TermsAndConditions = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.heroTitle}>Terms &amp; <span>Conditions</span></h1>
          <p className={styles.heroSub}>Last updated: April 2026 — Please read these terms carefully before using CampusGarh.</p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.intro}>
          <p>
            These Terms and Conditions ("Terms") govern your access to and use of the CampusGarh platform,
            including our website, mobile applications, and related services. Please read them carefully.
          </p>
        </div>

        <div className={styles.accordion}>
          {SECTIONS.map((sec, i) => (
            <div key={i} className={styles.accItem}>
              <button className={styles.accQ} onClick={() => setOpen(open === i ? null : i)}>
                {sec.title}
                <span className={styles.accToggle}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className={styles.accA}>
                  {sec.content.split('\n').map((line, j) => (
                    <p key={j} style={{ marginBottom: line.startsWith('•') ? '0.4rem' : '0.75rem' }}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
