import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './StudyPlaces.module.css';

import imgDelhi     from '../../assets/places/delhi.jpg';
import imgMumbai    from '../../assets/places/mumbai.jpg';
import imgBangalore from '../../assets/places/bangalore.jpg';
import imgPune      from '../../assets/places/pune.jpg';
import imgChennai   from '../../assets/places/chennai.jpg';
import imgHyderabad from '../../assets/places/hyderabad.jpg';
import imgKolkata   from '../../assets/places/kolkata.jpg';
import imgJaipur    from '../../assets/places/jaipur.jpg';

const PLACES = [
  { id: 'delhi',     label: 'New Delhi',  state: 'Delhi',       query: 'city=delhi',     colleges: '120+', image: imgDelhi     },
  { id: 'mumbai',    label: 'Mumbai',     state: 'Maharashtra', query: 'city=mumbai',    colleges: '180+', image: imgMumbai    },
  { id: 'bangalore', label: 'Bangalore',  state: 'Karnataka',   query: 'city=bangalore', colleges: '200+', image: imgBangalore },
  { id: 'pune',      label: 'Pune',       state: 'Maharashtra', query: 'city=pune',      colleges: '150+', image: imgPune      },
  { id: 'chennai',   label: 'Chennai',    state: 'Tamil Nadu',  query: 'city=chennai',   colleges: '100+', image: imgChennai   },
  { id: 'hyderabad', label: 'Hyderabad',  state: 'Telangana',   query: 'city=hyderabad', colleges: '130+', image: imgHyderabad },
  { id: 'kolkata',   label: 'Kolkata',    state: 'West Bengal', query: 'city=kolkata',   colleges: '90+',  image: imgKolkata   },
  { id: 'jaipur',    label: 'Jaipur',     state: 'Rajasthan',   query: 'city=jaipur',    colleges: '70+',  image: imgJaipur    },
];

const TOTAL = PLACES.length;   // 8
const CLONE = 4;               // clones on each side
// [last-4-clones | real-8 | first-4-clones] = 16 items total
const EXT = [
  ...PLACES.slice(-CLONE),
  ...PLACES,
  ...PLACES.slice(0, CLONE),
];
const EXT_LEN = EXT.length;   // 16

const getVisible = () => {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth <= 480)  return 1;
  if (window.innerWidth <= 768)  return 2;
  if (window.innerWidth <= 1024) return 3;
  return 4;
};

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const StudyPlaces = () => {
  const [idx,     setIdx]     = useState(CLONE); // CLONE = first real item
  const [anim,    setAnim]    = useState(false);
  const [visible, setVisible] = useState(getVisible);
  const [paused,  setPaused]  = useState(false);
  const autoRef = useRef(null);

  // Which real dot to highlight (0..TOTAL-1)
  const dotIdx = ((idx - CLONE) % TOTAL + TOTAL) % TOTAL;

  // Responsive visible count
  useEffect(() => {
    const onResize = () => setVisible(getVisible());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const slideTo = useCallback((i) => { setAnim(true);  setIdx(i); }, []);
  const jumpTo  = useCallback((i) => { setAnim(false); setIdx(i); }, []);

  // After CSS transition: silently jump if we landed on a clone
  const onTransitionEnd = useCallback(() => {
    if (idx >= CLONE + TOTAL) {
      jumpTo(CLONE + ((idx - CLONE) % TOTAL));
    } else if (idx < CLONE) {
      jumpTo(CLONE + ((idx - CLONE + TOTAL * 10) % TOTAL));
    }
  }, [idx, jumpTo]);

  // Autoplay — resets on every idx change
  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(() => {
      setAnim(true);
      setIdx(i => i + 1);
    }, 3200);
    return () => clearInterval(autoRef.current);
  }, [paused, idx]);

  // slider width fills exactly `visible` cards at a time
  const sliderWidth = `${(EXT_LEN / visible) * 100}%`;
  // translateX as % of slider's own width
  const translateX  = `${-(idx * 100 / EXT_LEN)}%`;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial="hidden" whileInView="visible"
          viewport={{ once: true }} variants={fadeUp}
        >
          <span className={styles.eyebrow}>Explore India</span>
          <h2 className={styles.title}>Top <em>Study Places</em></h2>
          <p className={styles.subtitle}>Premier education hubs across the country</p>
        </motion.div>

        <div
          className={styles.carouselWrap}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => slideTo(idx - 1)} aria-label="Previous">
            <FiChevronLeft size={20} />
          </button>

          <div className={styles.track}>
            <div
              className={styles.slider}
              style={{
                width: sliderWidth,
                transform: `translateX(${translateX})`,
                transition: anim ? 'transform 0.52s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                '--ext-len': EXT_LEN,
              }}
              onTransitionEnd={onTransitionEnd}
            >
              {EXT.map((p, i) => (
                <div key={`${p.id}-${i}`} className={styles.cardSlot}>
                  <Link
                    to={`/colleges?${p.query}`}
                    className={styles.card}
                    tabIndex={i >= CLONE && i < CLONE + TOTAL ? 0 : -1}
                    aria-hidden={i < CLONE || i >= CLONE + TOTAL}
                  >
                    <img src={p.image} alt={p.label} className={styles.cardImg} />
                    <div className={styles.cardGlow} />
                    <div className={styles.cardDecor} />
                    <div className={styles.cardBody}>
                      <FiMapPin className={styles.pin} size={14} />
                      <h3 className={styles.cardCity}>{p.label}</h3>
                      <p className={styles.cardState}>{p.state}</p>
                      <span className={styles.cardBadge}>{p.colleges} Colleges</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => slideTo(idx + 1)} aria-label="Next">
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Dots — always TOTAL items, never EXT_LEN */}
        <div className={styles.dots}>
          {PLACES.map((p, i) => (
            <button
              key={p.id}
              className={`${styles.dot} ${dotIdx === i ? styles.dotActive : ''}`}
              onClick={() => slideTo(CLONE + i)}
              aria-label={`Go to ${p.label}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudyPlaces;
