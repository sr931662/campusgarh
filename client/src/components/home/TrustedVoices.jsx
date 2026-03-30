import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videoTestimonialService } from '../../services/videoTestimonialService';
import styles from './TrustedVoices.module.css';

export default function TrustedVoices() {
  const { data, isLoading } = useQuery({
    queryKey: ['video-testimonials'],
    queryFn: () => videoTestimonialService.getAll().then(r => r.data.data),
  });

  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const timerRef = useRef(null);
  const VISIBLE = 4;

  const items = data || [];

  useEffect(() => {
    if (!playingId) {
      timerRef.current = setInterval(() => {
        setIndex(i => (i + 1) % Math.max(1, items.length - VISIBLE + 1));
      }, 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [items.length, playingId]);

  if (isLoading || items.length === 0) return null;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(items.length - VISIBLE, i + 1));

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>Trusted Voices</p>
        <h2 className={styles.title}>
          <strong>Hear them</strong> out
        </h2>
      </div>

      <div className={styles.sliderWrapper}>
        <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>&#8249;</button>

        <div className={styles.track}>
          <div
            className={styles.inner}
            style={{ transform: `translateX(calc(-${index} * (var(--card-w) + 20px)))` }}
          >
            {items.map(item => (
              <div key={item._id} className={styles.card}>
                <div className={styles.viewsBadge}>👁 {item.views}</div>
                {playingId === item._id ? (
                  <iframe
                    src={`${item.videoUrl}?autoplay=1`}
                    title={item.title}
                    allow="autoplay; fullscreen"
                    className={styles.iframe}
                  />
                ) : (
                  <div className={styles.thumb} onClick={() => setPlayingId(item._id)}>
                    <img src={item.thumbnailUrl} alt={item.title} />
                    <div className={styles.playBtn}>&#9654;</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className={`${styles.arrow} ${styles.right}`} onClick={next}>&#8250;</button>
      </div>

      <div className={styles.footer}>
        <a
          href="https://www.youtube.com/@CampusGarh"
          target="_blank"
          rel="noreferrer"
          className={styles.ytLink}
        >
          WATCH 100+ SUCCESS STORIES ON YOUTUBE &rsaquo;
        </a>
      </div>
    </section>
  );
}
