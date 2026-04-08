import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEnquiry } from '../hooks/queries';
import { FaPhone, FaEnvelope, FaClock, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Contact.module.css';

const CONTACT_INFO = [
  { icon: <FaPhone />,        label: 'Phone',           value: '+91 9811-257-505' },
  { icon: <FaEnvelope />,     label: 'Email',           value: 'support@campusgarh.com' },
  { icon: <FaClock />,        label: 'Response Time',   value: 'Within 24–48 hours' },
  { icon: <FaGraduationCap />, label: 'Free Counselling', value: 'Talk to an expert — no charges' },
];

const CONTACT_FAQS = [
  { q: 'How can I contact CampusGarh?', a: 'You can reach us through the contact form on this page. Fill in your name, email, phone, and message and our team will respond within 24–48 hours.' },
  { q: 'What kind of queries can I send?', a: 'You can reach out for help with college discovery, course suggestions, exam queries, platform issues, partnership inquiries, or general feedback.' },
  { q: 'How long does it take to get a response?', a: 'Our team typically responds within 24–48 hours on working days. For urgent queries, please mention it in your message.' },
  { q: 'Can I speak to a counsellor directly?', a: 'Yes. After submitting your enquiry, our team can connect you with an ethical counsellor based on your needs — at no cost.' },
  { q: 'How do I report incorrect information?', a: 'Use the contact form and mention "Data Correction" in your message with the college/course name and the specific incorrect info. We will review and update it.' },
];

const FAQSection = ({ faqs }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Frequently Asked <span>Questions</span></h2>
        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <button className={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span className={styles.faqToggle}>{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <p className={styles.faqA}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm();
  const createEnquiry = useCreateEnquiry();

  const onSubmit = async (data) => {
    await createEnquiry.mutateAsync(data);
    reset();
  };

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>We're Here to Help</p>
          <h1 className={styles.heroTitle}>Get in <span>Touch</span></h1>
          <p className={styles.heroSub}>Have a question? Reach out — our team typically responds within 24–48 hours.</p>
        </div>
      </section>

      {/* ── INFO CARDS ── */}
      <section className={styles.infoSection}>
        <div className={styles.container}>
          <div className={styles.infoGrid}>
            {CONTACT_INFO.map((item) => (
              <div key={item.label} className={styles.infoCard}>
                <span className={styles.infoIcon}>{item.icon}</span>
                <div className={styles.infoLabel}>{item.label}</div>
                <div className={styles.infoValue}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className={styles.formSection}>
        <div className={styles.container}>
          <div className={styles.formWrap}>
            <div className={styles.formLeft}>
              <p className={styles.eyebrow}>Send a Message</p>
              <h2 className={styles.sectionTitle}>We'd love to <span>hear from you</span></h2>
              <p className={styles.formDesc}>
                Whether it's a query about a college, a technical issue, or just feedback — we read every message and respond personally.
              </p>
              <ul className={styles.formFeatures}>
                <li><FaCheckCircle /> Free, no-commitment support</li>
                <li><FaCheckCircle /> Counsellor connection on request</li>
                <li><FaCheckCircle /> Data correction requests welcome</li>
              </ul>
            </div>

            <div className={styles.formCard}>
              {isSubmitSuccessful ? (
                <div className={styles.successBox}>
                  <FaCheckCircle className={styles.successIcon} />
                  <h3>Message Sent!</h3>
                  <p>Thank you! Our team will reach out within 24–48 hours.</p>
                  <Link to="/" className={styles.backHome}>Back to Home</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Name <span>*</span></label>
                      <input {...register('studentName', { required: 'Name is required' })} placeholder="Your full name" />
                      {errors.studentName && <span className={styles.err}>{errors.studentName.message}</span>}
                    </div>
                    <div className={styles.field}>
                      <label>Email <span>*</span></label>
                      <input type="email" {...register('email', { required: 'Email is required' })} placeholder="you@email.com" />
                      {errors.email && <span className={styles.err}>{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Phone <span>*</span></label>
                    <input type="tel" {...register('phone', { required: 'Phone is required' })} placeholder="10-digit mobile number" />
                    {errors.phone && <span className={styles.err}>{errors.phone.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label>Message</label>
                    <textarea rows={5} {...register('message')} placeholder="Tell us how we can help you..." />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={createEnquiry.isPending}>
                    {createEnquiry.isPending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <FAQSection faqs={CONTACT_FAQS} />
    </div>
  );
};

export default Contact;
