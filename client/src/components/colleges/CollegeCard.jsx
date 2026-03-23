import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Card from '../common/Card/Card';
import RatingStars from '../common/RatingStars/RatingStars';
import styles from './CollegeCard.module.css';
import { formatCurrency } from '../../utils/formatters';

function logoInitials(name = '', shortName = '') {
  const src = shortName || name;
  return src.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

const CollegeCard = ({ college }) => {
  const {
    name, slug, contact, collegeType, fundingType, placementStats, fees, rankings,
    averageRating, isVerified, accreditation, approvedBy, logoUrl, shortName,
  } = college;

  const latestRanking = rankings?.find(r => r.year === new Date().getFullYear()) || rankings?.[0];
  const avgPackage = placementStats?.averagePackage;
  const annualFees = fees?.total || fees?.tuitionFee || 'N/A';
  const placementPct = placementStats?.placementPercentage;

  return (
    <Link to={`/colleges/${slug}`} className={styles.link}>
      <Card hover className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoBox}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className={styles.logoImg}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
              />
            ) : null}
            <span
              className={styles.logoInitials}
              style={logoUrl ? { display: 'none' } : undefined}
            >
              {logoInitials(name, shortName)}
            </span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.nameContainer}>
              <h3 className={styles.name}>{name}</h3>
              {isVerified && <span className={styles.verifiedBadge}>✓ Verified</span>}
            </div>
            <div className={styles.badges}>
              {fundingType && <div className={styles.fundingBadge}>{fundingType}</div>}
              {collegeType && <div className={styles.typeBadge}>{collegeType}</div>}
            </div>
          </div>
        </div>

        <div className={styles.location}>
          <FaMapMarkerAlt /> {contact?.city}, {contact?.state}
        </div>

        {/* Accreditation & Approvals row */}
        <div className={styles.accredRow}>
          {accreditation?.naacGrade && (
            <span className={styles.naacBadge}>NAAC {accreditation.naacGrade}</span>
          )}
          {approvedBy?.slice(0, 2).map((body) => (
            <span key={body} className={styles.approvalPill}>{body}</span>
          ))}
        </div>

        <div className={styles.rating}>
          {averageRating > 0 ? (
            <>
              <RatingStars rating={averageRating} size="sm" />
              <span className={styles.reviewCount}>({college.reviewCount || 0} reviews)</span>
            </>
          ) : (
            <span className={styles.noRating}>No reviews yet</span>
          )}
        </div>

        <div className={styles.stats}>
          {avgPackage && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Avg Package</span>
              <span className={styles.statValue}>{formatCurrency(avgPackage)}</span>
            </div>
          )}
          {placementPct && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Placement</span>
              <span className={styles.statValue}>{placementPct}%</span>
            </div>
          )}
          {latestRanking && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>NIRF Rank</span>
              <span className={styles.statValue}>#{latestRanking.rank}</span>
            </div>
          )}
          {annualFees !== 'N/A' && (
            <div className={styles.stat}>
              <span className={styles.statLabel}>Annual Fees</span>
              <span className={styles.statValue}>{formatCurrency(annualFees)}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default CollegeCard;