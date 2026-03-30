import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mediaService } from '../../services/mediaService';
import styles from './CollegeGallery.module.css';

export default function CollegeGallery({ collegeId }) {
  const [lightbox, setLightbox] = useState(null); // index of open image

  const { data, isLoading } = useQuery({
    queryKey: ['college-media', collegeId],
    queryFn: () => mediaService.getMediaForParent('College', collegeId).then(r => r.data.data),
    enabled: !!collegeId,
  });

  const images = (data?.data || []).filter(m => m.type === 'image');
  const videos = (data?.data || []).filter(m => m.type === 'video');

  if (isLoading) return <div className={styles.loading}>Loading gallery…</div>;
  if (!images.length && !videos.length) {
    return <div className={styles.empty}>No gallery media available for this college.</div>;
  }

  const prev = () => setLightbox(i => (i - 1 + images.length) % images.length);
  const next = () => setLightbox(i => (i + 1) % images.length);

  return (
    <div className={styles.wrap}>
      {/* ── Images ── */}
      {images.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Photos</h3>
          <div className={styles.grid}>
            {images.map((img, i) => (
              <div key={img._id} className={styles.thumb} onClick={() => setLightbox(i)}>
                <img src={img.url} alt={img.alt || `Photo ${i + 1}`} loading="lazy" />
                <div className={styles.thumbOverlay}>&#128269;</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Videos ── */}
      {videos.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Videos</h3>
          <div className={styles.videoGrid}>
            {videos.map(vid => (
              <div key={vid._id} className={styles.videoWrap}>
                <video controls src={vid.url} className={styles.video} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxBox} onClick={e => e.stopPropagation()}>
            <button className={styles.lbClose} onClick={() => setLightbox(null)}>×</button>
            <button className={styles.lbPrev} onClick={prev}>&#8249;</button>
            <img
              src={images[lightbox].url}
              alt={images[lightbox].alt || ''}
              className={styles.lbImage}
            />
            <button className={styles.lbNext} onClick={next}>&#8250;</button>
            <p className={styles.lbCounter}>{lightbox + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
