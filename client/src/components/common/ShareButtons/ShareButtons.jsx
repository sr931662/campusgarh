import { FaWhatsapp, FaFacebook, FaLinkedinIn, FaLink, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';

import styles from './ShareButtons.module.css';

export default function ShareButtons({ url, title, image }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const emailBody = image
    ? encodeURIComponent(`${title}\n${url}\n\nImage: ${image}`)
    : encodeURIComponent(`${title}\n${url}`);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => alert('Link copied!'));
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Share:</span>
      <a className={`${styles.btn} ${styles.wa}`} href={`https://api.whatsapp.com/send?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" title="WhatsApp"><FaWhatsapp /></a>
      <a className={`${styles.btn} ${styles.tw}`} href={`https://x.com/intent/tweet?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" title="X / Twitter"><FaXTwitter /></a>
      <a className={`${styles.btn} ${styles.fb}`} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebook /></a>
      <a className={`${styles.btn} ${styles.li}`} href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedinIn /></a>
      <a className={`${styles.btn} ${styles.gmail}`} href={`https://mail.google.com/mail/?view=cm&fs=1&su=${t}&body=${emailBody}`} target="_blank" rel="noopener noreferrer" title="Gmail"><SiGmail /></a>
      <a className={`${styles.btn} ${styles.outlook}`} href={`https://outlook.live.com/mail/0/deeplink/compose?subject=${t}&body=${emailBody}`} target="_blank" rel="noopener noreferrer" title="Outlook"><FaEnvelope /></a>
      <button className={`${styles.btn} ${styles.copy}`} onClick={copyLink} title="Copy link"><FaLink /></button>
    </div>
  );
}
