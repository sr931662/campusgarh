import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaTrophy, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import styles from './CollegeCard.module.css';

const fmtLakh = (n) => { if (!n) return null; const l = Number(n) / 100000; return `₹${l.toFixed(1)}L`; };
const fmtLPA  = (n) => { if (!n) return null; const v = Number(n); return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} LPA`; };
const initials = (name = '', short = '') => (short || name).split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const CollegeCard = ({ college }) => {
  const {
    name, slug, shortName, description,
    contact, fundingType, collegeType, establishmentYear,
    placementStats, fees, rankings, averageRating,
    coverImageUrl, logoUrl, approvedBy,
    accreditation,
  } = college;

  const nirfRank   = accreditation?.nirfRank || rankings?.find(r => r.source === 'NIRF')?.rank;
  const naacGrade  = accreditation?.naacGrade;
  const avgPackage = placementStats?.averagePackage;
  const feesMin    = fees?.tuitionFee;
  const feesMax    = fees?.total;
  const feesLabel  = feesMin && feesMax && feesMin !== feesMax
    ? `${fmtLakh(feesMin)} – ${fmtLakh(feesMax)}`
    : fmtLakh(feesMax || feesMin);

  // approvedBy: comma string or array → array
  const approvals = Array.isArray(approvedBy)
    ? approvedBy
    : typeof approvedBy === 'string'
      ? approvedBy.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  return (
    <div className={styles.card}>

      {/* ── Cover Image ── */}
      <div className={styles.imageWrap}>
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.initials}>{initials(name, shortName)}</span>
          </div>
        )}

        {/* Logo overlay — only if logoUrl exists */}
        {logoUrl && (
          <div className={styles.logoWrap}>
            <img src={logoUrl} alt={`${name} logo`} className={styles.logoImg} />
          </div>
        )}

        {/* NIRF rank badge — only if exists */}
        {nirfRank && (
          <span className={styles.rankBadge}>
            <FaTrophy size={10} /> #{nirfRank} NIRF
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>

        {/* Name */}
        <Link to={`/colleges/${slug}`} className={styles.nameLink}>
          <h3 className={styles.name}>{name}</h3>
        </Link>

        {/* Location */}
        {(contact?.city || contact?.state) && (
          <div className={styles.location}>
            <FaMapMarkerAlt size={11} />
            {[contact.city, contact.state].filter(Boolean).join(', ')}
          </div>
        )}

        {/* Meta tags row: discipline, institute type, established */}
        <div className={styles.metaRow}>
          {collegeType    && <span className={styles.metaTag}>{collegeType}</span>}
          {fundingType    && <span className={styles.metaTag}>{fundingType}</span>}
          {establishmentYear && <span className={styles.metaTag}><FaCalendarAlt size={9} /> Est. {establishmentYear}</span>}
          {naacGrade      && <span className={styles.naacTag}>NAAC {naacGrade}</span>}
        </div>

        {/* Description — only if exists, truncated to 2 lines */}
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {/* Approved by — only if exists */}
        {approvals.length > 0 && (
          <div className={styles.approvalsRow}>
            {approvals.map((a) => (
              <span key={a} className={styles.approvalBadge}>
                <FaCheckCircle size={9} /> {a}
              </span>
            ))}
          </div>
        )}

        {/* Rating row */}
        <div className={styles.ratingRow}>
          <FaStar className={styles.star} size={13} />
          <span className={styles.ratingVal}>{averageRating > 0 ? Number(averageRating).toFixed(1) : '—'}</span>
          <span className={styles.reviewCount}>({college.reviewCount || 0})</span>
        </div>

        {/* Stats: package + fees — only if exists */}
        {(avgPackage || feesLabel) && (
          <div className={styles.statsRow}>
            {avgPackage && (
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Avg. Package</span>
                <span className={`${styles.statValue} ${styles.goldValue}`}>{fmtLPA(avgPackage)}</span>
              </div>
            )}
            {feesLabel && (
              <div className={`${styles.statItem} ${styles.statRight}`}>
                <span className={styles.statLabel}>Fees Range</span>
                <span className={styles.statValue}>{feesLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Link to={`/colleges/${slug}`} className={styles.applyBtn}>View Details</Link>
          <Link to={`/compare?add=${slug}`} className={styles.compareBtn}>Compare</Link>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
