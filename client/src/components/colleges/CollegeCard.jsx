import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import styles from './CollegeCard.module.css';

const formatLPA = (n) => {
  if (!n) return null;
  const l = n / 100000;
  return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} LPA`;
};

const formatLakh = (n) => {
  if (!n) return null;
  const l = n / 100000;
  return `₹${l.toFixed(1)}L`;
};

function initials(name = '', short = '') {
  const src = short || name;
  return src.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const CollegeCard = ({ college }) => {
  const {
    name, slug, contact, fundingType, placementStats,
    fees, rankings, averageRating, coverImageUrl, shortName,
  } = college;

  const latestRanking = rankings?.find(r => r.year === new Date().getFullYear()) || rankings?.[0];
  const avgPackage    = placementStats?.averagePackage;
  const feesMin       = fees?.tuitionFee;
  const feesMax       = fees?.total;

  const feesLabel = feesMin && feesMax && feesMin !== feesMax
    ? `${formatLakh(feesMin)} – ${formatLakh(feesMax)}`
    : formatLakh(feesMax || feesMin);

  return (
    <div className={styles.card}>

      {/* ── Image ── */}
      <div className={styles.imageWrap}>
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.initials}>{initials(name, shortName)}</span>
          </div>
        )}
        {latestRanking && (
          <span className={styles.rankBadge}>
            #{latestRanking.rank} NIRF {latestRanking.agency || ''}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        <Link to={`/colleges/${slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{name}</h3>
        </Link>

        <div className={styles.location}>
          <FaMapMarkerAlt size={11} />
          {contact?.city}, {contact?.state}
        </div>

        <div className={styles.ratingRow}>
          <FaStar className={styles.star} size={13} />
          <span className={styles.ratingVal}>{averageRating > 0 ? averageRating.toFixed(1) : '—'}</span>
          <span className={styles.reviewCount}>({college.reviewCount || 0})</span>
          {fundingType && <span className={styles.fundingTag}>{fundingType}</span>}
        </div>

        <div className={styles.statsRow}>
          {avgPackage ? (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Avg. Package</span>
              <span className={`${styles.statValue} ${styles.goldValue}`}>{formatLPA(avgPackage)}</span>
            </div>
          ) : <div />}
          {feesLabel && (
            <div className={`${styles.statItem} ${styles.statRight}`}>
              <span className={styles.statLabel}>Fees Range</span>
              <span className={styles.statValue}>{feesLabel}</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Link to={`/colleges/${slug}`} className={styles.applyBtn}>Apply Now</Link>
          <Link to={`/compare?add=${slug}`} className={styles.compareBtn}>Compare</Link>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
