import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaTrophy, FaCalendarAlt, FaUsers, FaBriefcase, FaRupeeSign, FaGraduationCap, FaMapMarkerAlt,
  FaFacebook, FaInstagram, FaLinkedinIn, FaYoutube, FaEnvelope,
} from 'react-icons/fa';
import { useColleges } from '../../hooks/queries';
import { parseMarkdown } from '../../utils/parseMarkdown';
import ShareButtons from '../common/ShareButtons/ShareButtons';
import { useCoursesForCollege } from '../../hooks/queries';

import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useCollegeBySlug, useAverageRating, useToggleSavedCollege } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatLPA } from '../../utils/formatters';
import RatingStars from '../common/RatingStars/RatingStars';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import CollegeReviews from './CollegeReviews';
import CollegePlacements from './CollegePlacements';
import CollegeFacilities from './CollegeFacilities';
import CollegeAdmission from './CollegeAdmission';
import CollegeCutoffs from './CollegeCutoffs';

import CollegeHostelCampus from './CollegeHostelCampus';
import CollegeEnquiryForm from './CollegeEnquiryForm';
import Modal from '../common/Modal/Modal';
import CollegeGallery from './CollegeGallery';

import styles from './CollegeDetail.module.css';
import SEOHead from '../common/SEOHead';

const SECTIONS = [
  { id: 'info',       label: 'Info' },
  { id: 'admission',  label: 'Admission' },
  { id: 'placements', label: 'Placements' },
  { id: 'cutoffs',    label: 'Cutoffs' },
  { id: 'hostel',     label: 'Hostel & Campus' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'gallery',    label: 'Gallery' },
  { id: 'reviews',    label: 'Reviews' },
];
export default function CollegeDetail() {
  const { slug } = useParams();
  const [activeSection, setActiveSection] = useState('info');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  // ── Data fetching ────────────────────────────────────────────────────────────
  const { data: axiosRes, isLoading, error } = useCollegeBySlug(slug);
  const college = axiosRes?.data?.data;
  const { data: courseMappingsRes } = useCoursesForCollege(college?._id);
  const collegeCourses = courseMappingsRes?.data?.data || [];

  const collegeSchema = college ? {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": college.name,
    "url": `https://campusgarh.com/colleges/${college.slug}`,
    "description": college.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": college.contact?.city,
      "addressRegion": college.contact?.state,
      "addressCountry": "IN"
    },
    "telephone": college.contact?.phone,
    "image": college.logoUrl,
  } : null;

  const { data: similarData } = useColleges({
    type: college?.collegeType,
    limit: 5,
  });
  const similarColleges = (similarData?.data?.data?.data || []).filter(c => c?._id && c._id !== college?._id).slice(0, 4);

  // Auto-open enquiry popup once college data is ready
  useEffect(() => {
    if (college) {
      const t = setTimeout(() => setShowEnquiryModal(true), 600);
      return () => clearTimeout(t);
    }
  }, [college?._id]);

  const { data: ratingData } = useAverageRating(college?._id);

  const { user, isAuthenticated } = useAuth();
  const { mutate: toggleSaved } = useToggleSavedCollege();

  const isSaved = user?.savedColleges?.some(
    id => id === college?._id || id?._id === college?._id || id?.toString() === college?._id?.toString()
  );

  // ── IntersectionObserver: highlight active tab on scroll ─────────────────────
  useEffect(() => {
    if (!college) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0% -70% 0%', threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [college]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 140; // navbar + tab bar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

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
        <span className={styles.errorIcon}><FaGraduationCap /></span>
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
    nirfRank       && { icon: <FaTrophy />,       label: 'NIRF Rank',   value: `#${nirfRank}` },
    college.establishmentYear && { icon: <FaCalendarAlt />, label: 'Est.',       value: college.establishmentYear },
    college.campusInfo?.totalStudents && { icon: <FaUsers />, label: 'Students', value: college.campusInfo.totalStudents.toLocaleString('en-IN') },
    placementPct   && { icon: <FaBriefcase />,    label: 'Placement',   value: `${placementPct}%` },
    avgPackage     && { icon: <FaRupeeSign />,    label: 'Avg Package', value: formatLPA(avgPackage) },
    college.fees?.total && { icon: <FaGraduationCap />, label: 'Annual Fees', value: formatCurrency(college.fees.total) },
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      <SEOHead
        title={college?.name}
        description={`${college?.name} — fees, placements, reviews, and admission details. ${college?.contact?.city}, ${college?.contact?.state}.`}
        keywords={`${college?.name}, ${college?.contact?.city} colleges, ${college?.collegeType}, admission 2025`}
        canonical={`https://campusgarh.com/colleges/${college?.slug}`}
        image={college?.logoUrl}
        favicon={college?.logoUrl}
        type="article"
        schema={collegeSchema}
      />
      {/* ── HERO ── */}

      <section
        className={styles.hero}
        style={college.coverImageUrl ? {
          backgroundImage: `url(${college.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : undefined}
      >
        
        <div className={styles.heroNoise} />

        <div className={styles.heroInner}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/colleges">Colleges</Link>
            <span>/</span>
            <span>{college.name}</span>
          </nav>

      <ShareButtons
        url={`https://campusgarh.com/colleges/${college.slug}`}
        title={college.name}
        image={college.coverImageUrl || college.logoUrl}
      />
          {/* College logo */}
          <div className={styles.collegeLogo}>
            {college.logoUrl ? (
              <img
                src={college.logoUrl}
                alt={college.name}
                className={styles.collegeLogoImg}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
              />
            ) : null}
            <span
              className={styles.collegeLogoInitials}
              style={college.logoUrl ? { display: 'none' } : undefined}
            >
              {(college.shortName || college.name).split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')}
            </span>
          </div>

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
              <span className={styles.pinIcon}><FaMapMarkerAlt /></span> {location}
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
                className={styles.btnSecondary}>
                Visit Website ↗
              </a>
            )}
            {/* Apply Now opens enquiry modal */}
            <button className={styles.btnPrimary} onClick={() => setShowEnquiryModal(true)}>
              Apply Now ↗
            </button>
            {isAuthenticated && (
              <button
                className={`${styles.btnSecondary} ${isSaved ? styles.btnSaved : ''}`}
                onClick={() => toggleSaved(college._id)}
              >
                {isSaved ? <><FaHeart /> Saved</> : <><FaRegHeart /> Save</>}
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── STICKY TAB BAR ────────────────────────────────────────────────────── */}
      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar}>
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`${styles.tabBtn} ${activeSection === sec.id ? styles.tabBtnActive : ''}`}
              onClick={() => scrollToSection(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALL SECTIONS (single page, scroll-based) ──────────────────────────── */}
      <div className={styles.contentWrap}>
        
        <div className={styles.contentLayout}>
          <div className={styles.content}>

            {/* INFO ────────────────────────────────────────────────────── */}
            <div id="info" className={styles.section}>
              {/* About */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>About {college.name}</h2>
                {college.description
                  ? <div className={styles.desc} dangerouslySetInnerHTML={{ __html: parseMarkdown(college.description) }} />
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
              {collegeCourses.length > 0 && (
                <div className={styles.card}>
                  <h3 className={styles.cardSubTitle}>Courses Offered</h3>
                  <div className={styles.coursesGrid}>
                    {collegeCourses.map(mapping => {
                      const course = mapping.course;
                      return (
                      <Link key={mapping._id} to={`/courses/${course?.slug}`} className={styles.courseChip}>
                        <span className={styles.courseCategory}>{course?.category}</span>
                        <span className={styles.courseName}>{course?.name}</span>
                        {course?.duration && <span className={styles.courseDuration}>{course.duration}</span>}
                        {mapping.fees && <span className={styles.courseDuration}>₹{mapping.fees.toLocaleString('en-IN')}/yr</span>}

                      </Link>
                    );})}
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
                    {college.socialMedia.facebook  && <a href={college.socialMedia.facebook}  target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaFacebook /> Facebook</a>}
                    {college.socialMedia.twitter   && <a href={college.socialMedia.twitter}   target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaXTwitter /> Twitter</a>}
                    {college.socialMedia.instagram && <a href={college.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaInstagram /> Instagram</a>}
                    {college.socialMedia.linkedin  && <a href={college.socialMedia.linkedin}  target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaLinkedinIn /> LinkedIn</a>}
                    {college.socialMedia.youtube   && <a href={college.socialMedia.youtube}   target="_blank" rel="noopener noreferrer" className={styles.socialLink}><FaYoutube /> YouTube</a>}
                  </div>
                </div>
              )}
            </div>

            {/* ADMISSION ──────────────────────────────────────────────── */}
            <div id="admission" className={styles.section}>
              <CollegeAdmission college={college} />
            </div>

            {/* PLACEMENTS ─────────────────────────────────────────────── */}
            <div id="placements" className={styles.section}>
              <CollegePlacements college={college} />
            </div>

            {/* CUTOFFS ────────────────────────────────────────────────── */}
            <div id="cutoffs" className={styles.section}>
              <CollegeCutoffs college={college} />
            </div>

            {/* HOSTEL & CAMPUS ────────────────────────────────────────── */}
            <div id="hostel" className={styles.section}>
              <CollegeHostelCampus college={college} />
            </div>

            {/* FACILITIES ─────────────────────────────────────────────── */}
            <div id="facilities" className={styles.section}>
              <CollegeFacilities college={college} />
            </div>

            {/* GALLERY ───────────────────────────────────────────── */}
            <div id="gallery" className={styles.section}>
              <CollegeGallery collegeId={college._id} directImages={college.galleryImages || []} coverImageUrl={college.coverImageUrl} />
            </div>

            {/* REVIEWS ────────────────────────────────────────────────── */}
            <div id="reviews" className={styles.section}>
              <CollegeReviews collegeId={college._id} />
            </div>

          </div>

          {/* ── SIDEBAR: Lead capture form ─────────────────────────────── */}
          <aside className={styles.sidebar}>
            <CollegeEnquiryForm college={college} />
          </aside>
        </div>
      </div>

      {/* ── MOBILE STICKY CTA BAR ─────────────────────────────────────────────── */}
      <div className={styles.mobileCTA}>
        <button className={styles.mobileCTAApply} onClick={() => setShowEnquiryModal(true)}>
          Apply Now ↗
        </button>
        <button className={styles.mobileCTAEnquire} onClick={() => setShowEnquiryModal(true)}>
          <FaEnvelope /> Enquire
        </button>
      </div>

      {/* ── SIMILAR COLLEGES ──────────────────────────────────────────────────── */}
      {similarColleges.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', borderTop: '1px solid #E8E3DB' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Similar Colleges</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {similarColleges.map(c => (
              <Link key={c._id} to={`/colleges/${c.slug}`}
                style={{ padding: '1.25rem', border: '1px solid #E8E3DB', borderRadius: '12px',
                  textDecoration: 'none', color: '#1C1C1E', transition: 'box-shadow 0.2s',
                  display: 'flex', flexDirection: 'column', gap: '0.3rem',
                  background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.68rem', color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase' }}>{c.collegeType}</span>
                <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                {c.contact?.city && <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{c.contact.city}, {c.contact?.state}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── ENQUIRY MODAL ─────────────────────────────────────────────────────── */}
      <Modal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)}>
        <CollegeEnquiryForm college={college} />
      </Modal>

      {/* ── FLOATING ENQUIRE BUTTON (always visible on desktop) ───────────────── */}
      <button
        className={styles.fabEnquire}
        onClick={() => setShowEnquiryModal(true)}
        aria-label="Enquire about this college"
      >
        <FaEnvelope />
        <span>Enquire</span>
      </button>
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
