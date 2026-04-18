import { useState } from 'react';
import { FaWhatsapp, FaLink, FaEnvelope } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import styles from './ShareButtons.module.css';

export default function ShareButtons({ url, title, image, excerpt }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, title, url, image: image || '', excerpt: excerpt || '' }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEmail('');
    setStatus('idle');
  };

  return (
    <>
      <div className={styles.wrap}>
        <span className={styles.label}>Share:</span>
        <a className={`${styles.btn} ${styles.wa}`} href={`https://api.whatsapp.com/send?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"><FaWhatsapp /></a>
        <button className={`${styles.btn} ${styles.gmail}`} onClick={() => setModalOpen(true)} title="Share via Gmail"><SiGmail /></button>
        <button className={`${styles.btn} ${styles.outlook}`} onClick={() => setModalOpen(true)} title="Share via Outlook"><FaEnvelope /></button>
        <button className={`${styles.btn} ${styles.copy}`} onClick={copyLink} title="Copy link"><FaLink /></button>
      </div>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>✕</button>
            <div className={styles.modalHeader}>
              <FaEnvelope className={styles.modalIcon} />
              <h3>Share via Email</h3>
            </div>
            <p className={styles.modalSub}>We'll send a beautifully formatted email with the article preview to the address below.</p>
            {status === 'success' ? (
              <div className={styles.successMsg}>
                <span>✓</span> Email sent successfully!
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className={styles.modalForm}>
                <input
                  type="email"
                  placeholder="Recipient's email address"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                  className={styles.modalInput}
                  disabled={status === 'loading'}
                  autoFocus
                />
                {status === 'error' && <p className={styles.errorMsg}>Something went wrong. Please try again.</p>}
                <button type="submit" className={styles.modalBtn} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send Email'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
