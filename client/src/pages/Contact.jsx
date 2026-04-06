import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateEnquiry } from '../hooks/queries';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import styles from './Contact.module.css';


const CONTACT_FAQS = [
  { q: 'How can I contact CampusGarh?', a: 'You can reach us through the contact form on this page. Fill in your name, email, phone, and message and our team will respond within 24–48 hours.' },
  { q: 'What kind of queries can I send?', a: 'You can reach out for help with college discovery, course suggestions, exam queries, platform issues, partnership inquiries, or general feedback.' },
  { q: 'How long does it take to get a response?', a: 'Our team typically responds within 24–48 hours on working days. For urgent queries, please mention it in your message.' },
  { q: 'Can I speak to a counsellor directly?', a: 'Yes. After submitting your enquiry, our team can connect you with an ethical counsellor based on your needs — at no cost.' },
  { q: 'How do I report incorrect information on CampusGarh?', a: 'Use the contact form and mention "Data Correction" in your message with the college/course name and the specific incorrect information. We will review and update it.' },
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


const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const createEnquiry = useCreateEnquiry();

  const onSubmit = async (data) => {
    await createEnquiry.mutateAsync(data);
    reset();
  };

  return (
  <div className={styles.container}>
    <div className={styles.hero}>
      <h1>Get in Touch</h1>
      <p>Have a question? We're here to help — reach out anytime.</p>
    </div>

    <div className={styles.content}>
      {/* Info panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>📞</div>
          <div>
            <div className={styles.infoLabel}>Phone</div>
            <div className={styles.infoValue}>1800-123-4567</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>✉️</div>
          <div>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>support@campusgarh.com</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🕐</div>
          <div>
            <div className={styles.infoLabel}>Response Time</div>
            <div className={styles.infoValue}>Within 24–48 hours</div>
          </div>
        </div>
        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🎓</div>
          <div>
            <div className={styles.infoLabel}>Free Counselling</div>
            <div className={styles.infoValue}>Talk to an expert — no charges</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card padding="lg" className={styles.card}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input {...register('studentName', { required: 'Name is required' })} placeholder="Your full name" />
            {errors.studentName && <span>{errors.studentName.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} placeholder="you@email.com" />
            {errors.email && <span>{errors.email.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Phone</label>
            <input type="tel" {...register('phone', { required: 'Phone is required' })} placeholder="10-digit mobile number" />
            {errors.phone && <span>{errors.phone.message}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Message</label>
            <textarea rows="5" {...register('message')} placeholder="Tell us how we can help you..." />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={createEnquiry.isPending}>
            Send Message
          </Button>
        </form>
      </Card>
    </div>

    <FAQSection faqs={CONTACT_FAQS} />
  </div>
);

};

export default Contact;