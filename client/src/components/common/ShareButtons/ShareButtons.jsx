import { useState } from 'react';
import { FaWhatsapp, FaLink, FaEnvelope } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import styles from './ShareButtons.module.css';

export default function ShareButtons({ url, title, excerpt }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const body = `Check out "${title}" on CampusGarh:\n${url}${excerpt ? `\n\n${excerpt}` : ''}`;
  const mailtoHref = `mailto:?subject=${encodeURIComponent(`Check this out: ${title}`)}&body=${encodeURIComponent(body)}`;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Share:</span>
      <a
        className={`${styles.btn} ${styles.wa}`}
        href={`https://api.whatsapp.com/send?text=${t}%20${u}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a
        className={`${styles.btn} ${styles.gmail}`}
        href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Check this out: ${title}`)}&body=${encodeURIComponent(body)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share via Gmail"
      >
        <SiGmail />
      </a>
      <a
        className={`${styles.btn} ${styles.outlook}`}
        href={mailtoHref}
        title="Share via Email"
      >
        <FaEnvelope />
      </a>
      <button
        className={`${styles.btn} ${styles.copy} ${copied ? styles.copied : ''}`}
        onClick={copyLink}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        <FaLink />
      </button>
    </div>
  );
}
