import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videoTestimonialService } from '../../services/videoTestimonialService';
import styles from './TrustedVoices.module.css';

const VISIBLE = 4;

export default function TrustedVoices() {
  const { data, isLoading } = useQuery({
    queryKey: ['video-testimonials'],
    queryFn: () => videoTestimonialService.getAll().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const [index, setIndex] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const timerRef = useRef(null);

  const items = data || [];
  const maxIndex = Math.max(0, items.length - VISIBLE);

  useEffect(() => {
    if (!playingId && items.length > VISIBLE) {
      timerRef.current = setInterval(() => {
        setIndex(i => (i >= maxIndex ? 0 : i + 1));
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [items.length, playingId, maxIndex]);

  if (isLoading || items.length === 0) return null;

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>Trusted Voices</p>
        <h2 className={styles.title}>
          <strong>Hear them</strong> out
        </h2>
      </div>

      <div className={styles.sliderWrapper}>
        <button
          className={styles.arrow}
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous"
        >
          &#8249;
        </button>

        <div className={styles.track}>
          <div
            className={styles.inner}
            style={{ transform: `translateX(calc(-${index} * (var(--card-w) + 20px)))` }}
          >
            {items.map(item => (
              <div key={item._id} className={styles.card}>
                {item.views && (
                  <div className={styles.viewsBadge}>👁 {item.views}</div>
                )}

                {playingId === item._id ? (
                  <iframe
                    src={`${item.videoUrl}?autoplay=1`}
                    title={item.title}
                    allow="autoplay; fullscreen"
                    className={styles.iframe}
                  />
                ) : (
                  <>
                    <div className={styles.thumb} onClick={() => setPlayingId(item._id)}>
                      <img src={item.thumbnailUrl} alt={item.title} />
                      <div className={styles.playBtn}>
                        <div className={styles.playIcon}>
                          <div className={styles.playTriangle} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardOverlay}>
                      <p className={styles.cardTitle}>{item.title}</p>
                      {item.description && (
                        <p className={styles.cardDesc}>{item.description}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.arrow}
          onClick={next}
          disabled={index >= maxIndex}
          aria-label="Next"
        >
          &#8250;
        </button>
      </div>

      {/* Dot indicators */}
      {items.length > VISIBLE && (
        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <a
          href="https://www.youtube.com/@CampusGarh"
          target="_blank"
          rel="noreferrer"
          className={styles.ytLink}
        >
          Watch 100+ success stories on YouTube &rsaquo;
        </a>
      </div>
    </section>
  );
}
