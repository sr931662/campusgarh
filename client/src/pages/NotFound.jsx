import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './NotFound.module.css';

const SUGGESTIONS = [
  { label: 'Browse Colleges',  to: '/colleges' },
  { label: 'Explore Courses',  to: '/courses'  },
  { label: 'View Exams',       to: '/exams'    },
  { label: 'Compare Colleges', to: '/compare'  },
  { label: 'News & Articles',  to: '/news'     },
  { label: 'Free Counselling', to: '/contact'  },
];

export default function NotFound() {
  const navigate  = useNavigate();
  const [count, setCount] = useState(10);

  // Auto-redirect to home after 10s
  useEffect(() => {
    if (count <= 0) { navigate('/'); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div className={styles.page}>

      {/* ── Ambient glow blobs ── */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.inner}>

        {/* Big 404 */}
        <div className={styles.codeWrap}>
          <span className={styles.four}>4</span>
          <span className={styles.zero}>
            <span className={styles.zeroDot} />
          </span>
          <span className={styles.four}>4</span>
        </div>

        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.sub}>
          Looks like this page took a gap year. The URL you entered doesn't exist or has been moved.
        </p>

        {/* Auto-redirect countdown */}
        <p className={styles.countdown}>
          Redirecting to home in <strong>{count}s</strong>
        </p>

        {/* Primary CTA */}
        <div className={styles.actions}>
          <Link to="/" className={styles.homeBtn}>← Go to Homepage</Link>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>Go Back</button>
        </div>

        {/* Quick links */}
        <div className={styles.suggestionsWrap}>
          <p className={styles.suggestLabel}>Or explore something helpful:</p>
          <div className={styles.suggestions}>
            {SUGGESTIONS.map(s => (
              <Link key={s.to} to={s.to} className={styles.chip}>{s.label}</Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
