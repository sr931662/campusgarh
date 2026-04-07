import React, { useState } from 'react';
import styles from './StaticPage.module.css';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, fill out a form, or contact us for support. This includes:
    
• Personal details: name, email address, phone number, city/state
• Academic details: courses of interest, preferred colleges, entrance exam scores
• Usage data: pages visited, search queries, colleges compared or saved
• Device & browser information for security and analytics purposes`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

• Provide, maintain, and improve our platform and services
• Personalize your experience — show relevant colleges, courses, and exams
• Send important updates, admission alerts, and exam reminders (only if opted in)
• Connect you with counsellors you request guidance from
• Respond to your enquiries and support requests
• Analyse usage patterns to improve platform performance`,
  },
  {
    title: '3. Information Sharing',
    content: `CampusGarh does not sell your personal information to third parties. We may share your data only in the following cases:

• With counsellors or institutions, only when you explicitly request a connection
• With service providers (hosting, analytics) who are contractually bound to protect your data
• If required by law, regulation, or valid legal process
• To protect the rights, property, or safety of CampusGarh, our users, or others`,
  },
  {
    title: '4. Cookies & Tracking',
    content: `We use cookies and similar tracking technologies to:

• Keep you logged in during your session
• Remember your preferences and filters
• Understand how users navigate our platform (via anonymised analytics)

You can control cookies through your browser settings. Disabling cookies may affect certain features of the platform.`,
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures including:

• HTTPS encryption for all data transmission
• Secure password hashing (bcrypt)
• Rate limiting and input validation to prevent abuse
• Regular security reviews

No system is 100% secure. We encourage you to use a strong password and not share login credentials.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your account and associated data
• Opt out of marketing communications at any time
• Lodge a complaint with a data protection authority

To exercise any of these rights, contact us at support@campusgarh.com.`,
  },
  {
    title: '7. Third-Party Links',
    content: `Our platform contains links to college websites, exam portals, and other external resources. CampusGarh is not responsible for the privacy practices of these third-party websites. We encourage you to review their privacy policies before providing personal information.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `CampusGarh is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of CampusGarh after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    content: `If you have questions or concerns about this Privacy Policy or your personal data, please contact us:

Email: support@campusgarh.com
Address: CampusGarh, India
Response Time: Within 48 hours on working days`,
  },
];

const PrivacyPolicy = () => {
  const [open, setOpen] = useState(null);
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.heroTitle}>Privacy <span>Policy</span></h1>
          <p className={styles.heroSub}>Last updated: April 2026 — We respect your privacy and are committed to protecting your personal data.</p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.intro}>
          <p>
            This Privacy Policy describes how CampusGarh ("we", "us", or "our") collects, uses, and shares
            information about you when you use our website and services. By using CampusGarh, you agree to
            the practices described in this policy.
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

export default PrivacyPolicy;
