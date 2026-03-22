import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCollegeBySlug, useAverageRating, useToggleSavedCollege } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';
import RatingStars from '../common/RatingStars/RatingStars';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import CollegeReviews from './CollegeReviews';
import CollegePlacements from './CollegePlacements';
import CollegeFacilities from './CollegeFacilities';
import CollegeAdmission from './CollegeAdmission';
import CollegeCutoffs from './CollegeCutoffs';
import CollegeHostelCampus from './CollegeHostelCampus';
import styles from './CollegeDetail.module.css';

const TABS = [
  { id: 'info',       label: 'Info' },
  { id: 'admission',  label: 'Admission' },
  { id: 'placements', label: 'Placements' },
  { id: 'cutoffs',    label: 'Cutoffs' },
  { id: 'hostel',     label: 'Hostel & Campus' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'reviews',    label: 'Reviews' },
];

export default function CollegeDetail() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  // ── Data fetching ────────────────────────────────────────────────────────────
  // axios response shape: { data: { success, message, data: collegeObject } }
  const { data: axiosRes, isLoading, error } = useCollegeBySlug(slug);
  const college = axiosRes?.data?.data;

  const { data: ratingData } = useAverageRating(college?._id);

  const { user, isAuthenticated } = useAuth();
  const { mutate: toggleSaved } = useToggleSavedCollege();

  const isSaved = user?.savedColleges?.some(
    id => id === college?._id || id?._id === college?._id || id?.toString() === college?._id?.toString()
  );

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader size="lg" />
        <p>Loading college details…</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}>🎓</span>
        <h2>College not found</h2>
        <p>We couldn't find a college at this URL.</p>
        <Link to="/colleges"><Button variant="primary">Browse Colleges</Button></Link>
      </div>
    );
  }

  // ── Derived display values ───────────────────────────────────────────────────
  const location = [college.contact?.city, college.contact?.state].filter(Boolean).join(', ');
  const { avgRating = 0, count: reviewCount = 0 } = ratingData?.data?.data || {};
  const nirfRank = college.accreditation?.nirfRank
    || college.rankings?.find(r => r.source === 'NIRF')?.rank;
  const latestPlacement = college.yearWisePlacements?.length
    ? [...college.yearWisePlacements].sort((a, b) => (b.year || 0) - (a.year || 0))[0]
    : null;
  const placementPct = latestPlacement?.placementPercentage
    || college.placementStats?.placementPercentage;
  const avgPackage = latestPlacement?.averagePackage
    || college.placementStats?.averagePackage;

  const quickStats = [
    nirfRank       && { icon: '🏆', label: 'NIRF Rank',  value: `#${nirfRank}` },
    college.establishmentYear && { icon: '📅', label: 'Est.',      value: college.establishmentYear },
    college.campusInfo?.totalStudents && { icon: '👥', label: 'Students', value: college.campusInfo.totalStudents.toLocaleString('en-IN') },
    placementPct   && { icon: '💼', label: 'Placement',  value: `${placementPct}%` },
    avgPackage     && { icon: '💰', label: 'Avg Package', value: formatCurrency(avgPackage) },
    college.fees?.total && { icon: '🎓', label: 'Annual Fees', value: formatCurrency(college.fees.total) },
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroNoise} />

        <div className={styles.heroInner}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/colleges">Colleges</Link>
            <span>/</span>
            <span>{college.name}</span>
          </nav>

          {/* Badges row */}
          <div className={styles.heroBadges}>
            {college.isVerified && (
              <span className={styles.verifiedBadge}>✓ Verified</span>
            )}
            {college.fundingType && (
              <span className={styles.fundingBadge}>{college.fundingType}</span>
            )}
            {college.collegeType && (
              <span className={styles.typeBadge}>{college.collegeType}</span>
            )}
          </div>

          {/* Name */}
          <h1 className={styles.heroName}>{college.name}</h1>
          {college.shortName && college.shortName !== college.name && (
            <p className={styles.heroShort}>{college.shortName}</p>
          )}

          {/* Location */}
          {location && (
            <p className={styles.heroLocation}>
              <span className={styles.pinIcon}>📍</span> {location}
              {college.contact?.address && ` · ${college.contact.address}`}
            </p>
          )}

          {/* Rating */}
          <div className={styles.heroRating}>
            <RatingStars rating={avgRating} size="md" showNumber />
            <span className={styles.reviewCount}>
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Quick stats strip */}
          {quickStats.length > 0 && (
            <div className={styles.statsStrip}>
              {quickStats.map((s, i) => (
                <div key={i} className={styles.statChip}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.statValue}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* NAAC & approvals */}
          <div className={styles.heroAccred}>
            {college.accreditation?.naacGrade && (
              <span className={styles.naacChip}>
                NAAC {college.accreditation.naacGrade}
              </span>
            )}
            {college.approvedBy?.map(body => (
              <span key={body} className={styles.approvalChip}>{body}</span>
            ))}
          </div>

          {/* Action buttons */}
          <div className={styles.heroActions}>
            {college.contact?.website && (
              <a href={college.contact.website} target="_blank" rel="noopener noreferrer"
                className={styles.btnPrimary}>
                Visit Website ↗
              </a>
            )}
            {college.admissionProcess?.applicationLink && (
              <a href={college.admissionProcess.applicationLink} target="_blank" rel="noopener noreferrer"
                className={styles.btnSecondary}>
                Apply Now
              </a>
            )}
            {isAuthenticated && (
              <button
                className={`${styles.btnSecondary} ${isSaved ? styles.btnSaved : ''}`}
                onClick={() => toggleSaved(college._id)}
              >
                {isSaved ? '❤️ Saved' : '🤍 Save'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── STICKY TAB BAR ────────────────────────────────────────────────────── */}
      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────────── */}
      <div className={styles.contentWrap}>
        <div className={styles.content}>

          {/* INFO ────────────────────────────────────────────────────── */}
          {activeTab === 'info' && (
            <div className={styles.section}>
              {/* About */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>About {college.name}</h2>
                {college.description
                  ? <p className={styles.desc}>{college.description}</p>
                  : <p className={styles.empty}>No description available.</p>
                }
              </div>

              {/* Two-column grid */}
              <div className={styles.infoGrid}>
                {/* Contact */}
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Contact Details</h3>
                  <dl className={styles.dl}>
                    {college.contact?.phone   && <><dt>Phone</dt><dd>{college.contact.phone}</dd></>}
                    {college.contact?.email   && <><dt>Email</dt><dd><a href={`mailto:${college.contact.email}`}>{college.contact.email}</a></dd></>}
                    {college.contact?.website && <><dt>Website</dt><dd><a href={college.contact.website} target="_blank" rel="noopener noreferrer">{college.contact.website}</a></dd></>}
                    {college.contact?.address && <><dt>Address</dt><dd>{college.contact.address}</dd></>}
                    {college.contact?.city    && <><dt>City</dt><dd>{college.contact.city}</dd></>}
                    {college.contact?.state   && <><dt>State</dt><dd>{college.contact.state}</dd></>}
                    {college.contact?.pincode && <><dt>Pincode</dt><dd>{college.contact.pincode}</dd></>}
                  </dl>
                </div>

                {/* Accreditation */}
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Accreditation & Rankings</h3>
                  <div className={styles.accredGrid}>
                    {college.accreditation?.naacGrade && (
                      <div className={styles.accredCard}>
                        <span className={styles.accredLabel}>NAAC Grade</span>
                        <span className={styles.accredValue}>{college.accreditation.naacGrade}</span>
                      </div>
                    )}
                    {college.accreditation?.nirfRank && (
                      <div className={styles.accredCard}>
                        <span className={styles.accredLabel}>NIRF Rank</span>
                        <span className={styles.accredValue}>#{college.accreditation.nirfRank}</span>
                      </div>
                    )}
                    {college.accreditation?.nbaStatus && (
                      <div className={styles.accredCard}>
                        <span className={styles.accredLabel}>NBA</span>
                        <span className={styles.accredValue}>Accredited</span>
                      </div>
                    )}
                    {college.accreditation?.otherAccreditations?.map(a => (
                      <div key={a} className={styles.accredCard}>
                        <span className={styles.accredLabel}>Accreditation</span>
                        <span className={styles.accredValue}>{a}</span>
                      </div>
                    ))}
                  </div>

                  {college.rankings?.length > 0 && (
                    <>
                      <h4 className={styles.rankingTitle}>Rankings</h4>
                      <div className={styles.rankTable}>
                        {college.rankings.map((r, i) => (
                          <div key={i} className={styles.rankRow}>
                            <span className={styles.rankSource}>{r.source}</span>
                            <span className={styles.rankCat}>{r.category}</span>
                            <span className={styles.rankYear}>{r.year}</span>
                            <span className={styles.rankVal}>#{r.rank}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Campus overview */}
              {college.campusInfo && Object.values(college.campusInfo).some(v => v) && (
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Campus Overview</h3>
                  <div className={styles.statsGridSmall}>
                    {college.campusInfo.totalArea      && <StatBox label="Campus Area" value={college.campusInfo.totalArea} />}
                    {college.campusInfo.campusType     && <StatBox label="Campus Type" value={college.campusInfo.campusType} />}
                    {college.campusInfo.totalStudents  && <StatBox label="Total Students" value={college.campusInfo.totalStudents.toLocaleString('en-IN')} />}
                    {college.campusInfo.totalFaculty   && <StatBox label="Total Faculty" value={college.campusInfo.totalFaculty} />}
                    {college.campusInfo.studentFacultyRatio && <StatBox label="S:F Ratio" value={college.campusInfo.studentFacultyRatio} />}
                    {college.campusInfo.departments    && <StatBox label="Departments" value={college.campusInfo.departments} />}
                  </div>
                </div>
              )}

              {/* Courses offered */}
              {college.courses?.length > 0 && (
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Courses Offered</h3>
                  <div className={styles.coursesGrid}>
                    {college.courses.map(course => (
                      <Link key={course._id} to={`/courses/${course.slug}`} className={styles.courseChip}>
                        <span className={styles.courseCategory}>{course.category}</span>
                        <span className={styles.courseName}>{course.name}</span>
                        {course.duration && <span className={styles.courseDuration}>{course.duration}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholarships */}
              {college.scholarships?.length > 0 && (
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Scholarships</h3>
                  <div className={styles.scholarGrid}>
                    {college.scholarships.map((s, i) => (
                      <div key={i} className={styles.scholarCard}>
                        <p className={styles.scholarName}>{s.name}</p>
                        {s.amount && <p className={styles.scholarAmt}>{formatCurrency(s.amount)}</p>}
                        {s.eligibility && <p className={styles.scholarElig}>{s.eligibility}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social media */}
              {college.socialMedia && Object.values(college.socialMedia).some(v => v) && (
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Social Media</h3>
                  <div className={styles.socialRow}>
                    {college.socialMedia.facebook  && <a href={college.socialMedia.facebook}  target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Facebook</a>}
                    {college.socialMedia.twitter   && <a href={college.socialMedia.twitter}   target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Twitter</a>}
                    {college.socialMedia.instagram && <a href={college.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Instagram</a>}
                    {college.socialMedia.linkedin  && <a href={college.socialMedia.linkedin}  target="_blank" rel="noopener noreferrer" className={styles.socialLink}>LinkedIn</a>}
                    {college.socialMedia.youtube   && <a href={college.socialMedia.youtube}   target="_blank" rel="noopener noreferrer" className={styles.socialLink}>YouTube</a>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADMISSION ──────────────────────────────────────────────── */}
          {activeTab === 'admission' && (
            <CollegeAdmission college={college} />
          )}

          {/* PLACEMENTS ─────────────────────────────────────────────── */}
          {activeTab === 'placements' && (
            <CollegePlacements college={college} />
          )}

          {/* CUTOFFS ────────────────────────────────────────────────── */}
          {activeTab === 'cutoffs' && (
            <CollegeCutoffs college={college} />
          )}

          {/* HOSTEL & CAMPUS ────────────────────────────────────────── */}
          {activeTab === 'hostel' && (
            <CollegeHostelCampus college={college} />
          )}

          {/* FACILITIES ─────────────────────────────────────────────── */}
          {activeTab === 'facilities' && (
            <CollegeFacilities college={college} />
          )}

          {/* REVIEWS ────────────────────────────────────────────────── */}
          {activeTab === 'reviews' && (
            <div className={styles.section}>
              <CollegeReviews collegeId={college._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small stat box helper component
function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--cream)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '0.875rem 1rem',
      textAlign: 'center',
    }}>
      <span style={{
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: 'var(--muted)',
        fontFamily: 'var(--font-mono)',
        marginBottom: '0.3rem',
      }}>{label}</span>
      <span style={{
        display: 'block',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--charcoal)',
        fontFamily: 'var(--font-display)',
        letterSpacing: '-0.02em',
      }}>{value}</span>
    </div>
  );
}