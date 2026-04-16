import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGears, FaStethoscope, FaScaleBalanced, FaLaptopCode, FaBuilding,
  FaGraduationCap, FaTrophy, FaNewspaper, FaStar, FaBookOpen,
} from 'react-icons/fa6';
import { useAuth } from '../store/authStore';

import { FaBriefcase, FaPalette, FaFlask, FaMapMarkerAlt, FaBullseye, FaHandshake, FaClipboardList } from 'react-icons/fa';
// import HeroCanvas from '../components/home/HeroCanvas';
import { useFeaturedColleges, useCourses, useUpcomingExams, useBlogs } from '../hooks/queries';
import styles from './Home.module.css';
import StudyPlaces from '../components/home/StudyPlaces';
import PredictorWidget from '../components/home/PredictorWidget';
import LatestArticles from '../components/home/LatestArticles';
import ExploreColleges from '../components/home/ExploreColleges';
import TrustedVoices from '../components/home/TrustedVoices';
import TopCourses from '../components/home/TopCourses';
import TopInstitutions from '../components/home/TopInstitutions';
import LeadCapturePopup from '../components/home/LeadCapturePopup';
import AccreditationBar from '../components/home/AccreditationBar';
import MeetCounselors from '../components/home/MeetCounselors';
import TopOnlineUniversities from '../components/home/TopOnlineUniversities';
import SEOHead from '../components/common/SEOHead';

const stats = [
  { num: '500+', label: 'Colleges' },
  { num: '1,200+', label: 'Courses' },
  { num: '80+', label: 'Entrance Exams' },
  { num: '25K+', label: 'Students Helped' },
];
// Schema
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "CampusGarh",
      "url": "https://campusgarh.com",
      "logo": "https://campusgarh.com/Campus%20png%20transparent-01.png",
      "sameAs": ["https://www.instagram.com/campusgarh", "https://www.linkedin.com/company/campusgarh"]
    },
    {
      "@type": "WebSite",
      "url": "https://campusgarh.com",
      "name": "CampusGarh",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://campusgarh.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
};


// URL param: `type` — must match COLLEGE_TYPES constants exactly (URL-encoded)
const streamCategories = [
  { icon: <FaGears />,         label: 'Engineering',  path: '/colleges?type=Engineering%20%26%20Technology' },
  { icon: <FaStethoscope />,   label: 'Medical',       path: '/colleges?type=Medical%20%26%20Health%20Sciences' },
  { icon: <FaBriefcase />,     label: 'Management',    path: '/colleges?type=Management%20%26%20Business' },
  { icon: <FaScaleBalanced />, label: 'Law',           path: '/colleges?type=Law' },
  { icon: <FaPalette />,       label: 'Design',        path: '/colleges?type=Design%20%26%20Fine%20Arts' },
  { icon: <FaFlask />,         label: 'Science',       path: '/colleges?type=Arts%20%26%20Science' },
];

// URL param: `discipline` — must match COURSE_DISCIPLINES constants exactly (URL-encoded)
const courseTypes = [
  { icon: <FaGears />,         label: 'B.Tech / BE',   count: 'Engineering & Technology', path: '/courses?discipline=Engineering%20%26%20Technology' },
  { icon: <FaStethoscope />,   label: 'MBBS / MD',      count: 'Medical & Health Sciences', path: '/courses?discipline=Medical%20%26%20Health%20Sciences' },
  { icon: <FaBriefcase />,     label: 'MBA / PGDM',     count: 'Management & Business',     path: '/courses?discipline=Management%20%26%20Business' },
  { icon: <FaScaleBalanced />, label: 'LLB / LLM',     count: 'Law',                       path: '/courses?discipline=Law' },
  { icon: <FaPalette />,       label: 'B.Des / M.Des',  count: 'Design & Fine Arts',        path: '/courses?discipline=Design%20%26%20Fine%20Arts' },
  { icon: <FaLaptopCode />,    label: 'BCA / MCA',      count: 'Technical',                 path: '/courses?discipline=Technical' },
  { icon: <FaFlask />,         label: 'B.Sc / M.Sc',   count: 'Arts & Science',            path: '/courses?discipline=Arts%20%26%20Science' },
  { icon: <FaBuilding />,      label: 'Architecture',   count: 'Architecture & Planning',   path: '/courses?discipline=Architecture%20%26%20Planning' },
];

// URL params: `category` (UG/PG/PhD/Diploma) + `examLevel` (National/State/University-Level)
// ExamList has no name-search filter, so we link to filtered list pages
const popularExams = [
  { name: 'JEE Main',  category: 'UG',  examLevel: 'National', desc: 'B.Tech / BE admissions at NITs, IIITs & GFTIs', dates: 'Jan & Apr', path: '/exams?category=UG&examLevel=National' },
  { name: 'NEET UG',   category: 'UG',  examLevel: 'National', desc: 'MBBS, BDS & allied health undergraduate admissions', dates: 'May',   path: '/exams?category=UG&examLevel=National' },
  { name: 'CAT',       category: 'PG',  examLevel: 'National', desc: 'IIM & top B-school MBA / PGDM admissions', dates: 'Nov',             path: '/exams?category=PG&examLevel=National' },
  { name: 'CLAT',      category: 'UG',  examLevel: 'National', desc: 'National Law University LLB admissions', dates: 'Dec',               path: '/exams?category=UG&examLevel=National' },
  { name: 'GATE',      category: 'PG',  examLevel: 'National', desc: 'Graduate engineering, M.Tech & PSU recruitment', dates: 'Feb',        path: '/exams?category=PG&examLevel=National' },
  { name: 'CUET UG',   category: 'UG',  examLevel: 'National', desc: 'Central university admissions — all streams', dates: 'May',           path: '/exams?category=UG&examLevel=National' },
];

const blogTopics = [
  { icon: <FaTrophy />,         label: 'College Rankings',  count: '48 articles',  path: '/news?contentType=Ranking',             accent: '#8b5cf6' },
  { icon: <FaBookOpen />,       label: 'Exam Guides',        count: '92 guides',    path: '/news?contentType=Guide',               accent: '#3b82f6' },
  { icon: <FaBriefcase />,      label: 'Career Advice',      count: '64 articles',  path: '/news?contentType=Career%20Advice',     accent: '#0891b2' },
  { icon: <FaNewspaper />,      label: 'Latest News',        count: '120+ posts',   path: '/news?contentType=News',                accent: '#f59e0b' },
  { icon: <FaGraduationCap />,  label: 'Scholarship Info',   count: '35 articles',  path: '/news?contentType=Scholarship',         accent: '#f97316' },
  { icon: <FaStar />,           label: 'College Reviews',    count: '80+ reviews',  path: '/news?contentType=College%20Review',    accent: '#10b981' },
];

const CATEGORY_COLORS = {
  Engineering: 'rgba(59,130,246,0.12)',
  Medical:     'rgba(16,185,129,0.12)',
  Management:  'rgba(245,158,11,0.12)',
  Law:         'rgba(139,92,246,0.12)',
  'All Streams': 'rgba(201,168,76,0.12)',
};

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const getRankBadge = (college) => {
  const r = college.rankings?.[0];
  if (r?.rank) return `#${r.rank} ${r.source || 'Ranked'}`;
  if (college.accreditation?.naacGrade) return `NAAC ${college.accreditation.naacGrade}`;
  return 'Featured';
};

const getCollegeMeta = (college) => {
  const parts = [];
  if (college.accreditation?.naacGrade) parts.push(`NAAC ${college.accreditation.naacGrade}`);
  if (college.placementStats?.placementPercentage) parts.push(`${college.placementStats.placementPercentage}% Placement`);
  if (college.accreditation?.nbaStatus) parts.push('NBA');
  return parts;
};

export default function Home() {
  const { data: featuredData, isLoading: featuredLoading } = useFeaturedColleges({ limit: 4 });
  const featuredColleges = featuredData?.data?.data?.data || [];
  const { user, isAuthenticated } = useAuth();

  return (
    <div className={styles.homeWrapper}>
      <SEOHead
        title="India's Most Trusted Student Platform"
        description="Discover 5,000+ colleges, compare courses, and get free unbiased admission guidance. Genuine student reviews and verified data across India."
        keywords="colleges in india, top colleges, engineering colleges, medical colleges, MBA colleges, entrance exams, college admission 2025"
        canonical="https://campusgarh.com"
        schema={homeSchema}
      />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className={styles.heroSection}>
        {/* <HeroCanvas /> */}
        <div className={styles.heroBgGradient} />

        <div className={styles.heroContent}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>

            <motion.p className={styles.heroEyebrow} variants={fadeUp}>
              India's Premier Education Portal
            </motion.p>

            <motion.h1 className={styles.heroTitle} variants={fadeUp}>
              Find Your{' '}
              <em>Perfect</em>{' '}
              Campus
            </motion.h1>

            <motion.p className={styles.heroSubtitle} variants={fadeUp}>
              Discover elite institutions, track competitive exams, and get honest
              ground-level reviews from real students across India.
            </motion.p>

            <motion.div className={styles.heroActions} variants={fadeUp}>
              <Link to="/colleges" className={styles.btnPrimary}>Explore Colleges</Link>
              <Link to="/courses"  className={styles.btnSecondary}>Browse Courses</Link>
              <Link to="/exams"    className={styles.btnSecondary}>View Exams</Link>
            </motion.div>

            <motion.div className={styles.heroStats} variants={fadeUp}>
              {stats.map((s) => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatNum}>{s.num}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </motion.div>

          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}><div className={styles.scrollWheel} /></div>
          <span className={styles.scrollText}>Scroll</span>
        </div>
      </section>

      
      <AccreditationBar />

      {/* ── BROWSE BY STREAM ────────────────────────────────────────────────── */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <motion.p
            className={styles.sectionLabel}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            Browse by Stream
          </motion.p>
          <motion.div
            className={styles.categoryGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {streamCategories.map((cat) => (
              <motion.div key={cat.label} variants={fadeUp}>
                <Link to={cat.path} className={styles.categoryCard}>
                  <span className={styles.categoryIcon}>{cat.icon}</span>
                  <span className={styles.categoryLabel}>{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED INSTITUTIONS ───────────────────────────────────────────── */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div>
              <p className={styles.sectionLabel}>Top Rated</p>
              <h2 className={styles.sectionTitle}>Featured <span>Institutions</span></h2>
            </div>
            <Link to="/colleges" className={styles.viewAll}>View All Colleges →</Link>
          </motion.div>

          <motion.div
            className={styles.institutionsGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {featuredLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className={styles.instSkeletonCard}>
                  <div className={styles.instSkeletonImg} />
                  <div className={styles.instSkeletonBody}>
                    <div className={styles.instSkeletonLine} style={{ width: '40%' }} />
                    <div className={styles.instSkeletonLine} style={{ width: '75%', height: 18 }} />
                    <div className={styles.instSkeletonLine} style={{ width: '60%' }} />
                    <div className={styles.instSkeletonLine} style={{ width: '30%' }} />
                  </div>
                </div>
              ))
            ) : featuredColleges.length > 0 ? (
              featuredColleges.map((college) => {
                const meta = getCollegeMeta(college);
                return (
                  <motion.div
                    key={college._id}
                    className={styles.institutionCard}
                    variants={fadeUp}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <div
                      className={styles.instCardImage}
                      style={college.coverImageUrl ? {
                        backgroundImage: `url(${college.coverImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      } : undefined}
                    >
                      <span className={styles.instRank}>{getRankBadge(college)}</span>
                      {college.logoUrl && (
                        <img src={college.logoUrl} alt={college.name} className={styles.instLogo} />
                      )}
                    </div>
                    <div className={styles.instCardBody}>
                      <span className={styles.instTag}>{college.collegeType || 'Institution'}</span>
                      <h3 className={styles.instName}>{college.name}</h3>
                      {(college.contact?.city || college.contact?.state) && (
                        <p className={styles.instLocation}>
                          <FaMapMarkerAlt /> {[college.contact.city, college.contact.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {meta.length > 0 && (
                        <div className={styles.instMeta}>
                          {meta.map((m) => (
                            <span key={m} className={styles.instMetaBadge}>{m}</span>
                          ))}
                        </div>
                      )}
                      <Link to={`/colleges/${college.slug}`} className={styles.instLink}>View Details →</Link>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p style={{ color: 'var(--muted)', gridColumn: '1/-1' }}>No featured colleges yet.</p>
            )}
          </motion.div>
        </div>
      </section>
      <ExploreColleges />

      <TopInstitutions />
      <TopOnlineUniversities />
      <TopCourses />

      {/* ── TOP STUDY PLACES ────────────────────────────────────────────────── */}
      <StudyPlaces />

      {/* ── EXPLORE COURSES ─────────────────────────────────────────────────── */}
      <section className={styles.coursesSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div>
              <p className={styles.sectionLabelLight}>1,200+ Programmes</p>
              <h2 className={styles.sectionTitleLight}>
                Explore <span>Courses</span>
              </h2>
              <p className={styles.sectionSubLight}>
                From undergraduate to postgraduate — find the right programme for your ambitions.
              </p>
            </div>
            <Link to="/courses" className={styles.viewAllLight}>View All Courses →</Link>
          </motion.div>

          <motion.div
            className={styles.courseTypesGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {courseTypes.map((ct) => (
              <motion.div key={ct.label} variants={fadeUp}>
                <Link to={ct.path} className={styles.courseTypeCard}>
                  <span className={styles.courseTypeIcon}>{ct.icon}</span>
                  <span className={styles.courseTypeLabel}>{ct.label}</span>
                  <span className={styles.courseTypeCount}>{ct.count}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ENTRANCE EXAMS ──────────────────────────────────────────────────── */}
      <section className={styles.examsSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div>
              <p className={styles.sectionLabel}>80+ Exams Tracked</p>
              <h2 className={styles.sectionTitle}>
                Ace Your <span>Entrance Exams</span>
              </h2>
              <p className={styles.examsDesc}>
                Stay updated on exam dates, eligibility, syllabus, cutoffs, and preparation tips — all in one place.
              </p>
            </div>
            <Link to="/exams" className={styles.viewAll}>Explore All Exams →</Link>
          </motion.div>

          <motion.div
            className={styles.examsGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {popularExams.map((exam) => (
              <motion.div key={exam.name} variants={fadeUp}>
                <Link to={exam.path} className={styles.examCard}>
                  <span
                    className={styles.examCatBadge}
                    style={{ background: CATEGORY_COLORS[exam.category] || 'rgba(201,168,76,0.12)' }}
                  >
                    {exam.category}
                  </span>
                  <span className={styles.examCardName}>{exam.name}</span>
                  <span className={styles.examCardDesc}>{exam.desc}</span>
                  <span className={styles.examCardDates}>{exam.dates}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
      <TrustedVoices />
      <MeetCounselors />

      {/* ── WHY CAMPUSGARH ──────────────────────────────────────────────────── */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div>
              <p className={styles.sectionLabel}>Why Choose Us</p>
              <h2 className={styles.sectionTitle}>Built for <span>Students</span></h2>
            </div>
          </motion.div>
          <motion.div
            className={styles.whyGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {[
              { icon: <FaBullseye />,      title: 'Curated Data',      desc: 'Verified college info, rankings, and placement records.' },
              { icon: <FaStar />,          title: 'Student Reviews',   desc: 'Honest, ground-level reviews from verified students and alumni.' },
              { icon: <FaClipboardList />, title: 'Exam Tracker',      desc: 'Stay on top of every entrance exam with dates and eligibility.' },
              { icon: <FaHandshake />,     title: 'Expert Counselling',desc: 'Connect with certified counsellors for personalised guidance.' },
            ].map((item) => (
              <motion.div key={item.title} className={styles.whyCard} variants={fadeUp}>
                <span className={styles.whyIcon}>{item.icon}</span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BLOG / INSIGHTS ─────────────────────────────────────────────────── */}
      <section className={styles.blogsSection}>
        <div className={styles.container}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div>
              <p className={styles.sectionLabel}>Knowledge Hub</p>
              <h2 className={styles.sectionTitle}>Insights &amp; <span>Guides</span></h2>
              <p className={styles.blogsSub}>
                Expert articles on admissions, rankings, career paths, and everything in between.
              </p>
            </div>
            <Link to="/news" className={styles.viewAll}>Read All Articles →</Link>
          </motion.div>

          <motion.div
            className={styles.blogTopicsGrid}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {blogTopics.map((topic) => (
              <motion.div key={topic.label} variants={fadeUp}>
                <Link to={topic.path} className={styles.blogTopicCard}>
                  <span
                    className={styles.blogTopicIconWrap}
                    style={{ background: `${topic.accent}18`, border: `1.5px solid ${topic.accent}30` }}
                  >
                    <span className={styles.blogTopicIcon} style={{ color: topic.accent }}>{topic.icon}</span>
                  </span>
                  <span className={styles.blogTopicLabel}>{topic.label}</span>
                  <span className={styles.blogTopicCount}>{topic.count}</span>
                  <span className={styles.blogTopicArrow} style={{ color: topic.accent }}>→</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <LatestArticles />

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      
      <section className={styles.ctaSection}>
         {/* NEW: Partners CTA Section */}
      {/* <section className={styles.partnersSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.eyebrow}>Grow with CampusGarh</div>
              <h2 className={styles.sectionTitle}>
                Join our <span>partner ecosystem</span>
              </h2>
              <p className={styles.sectionSub}>
                Collaborate with us to empower students and shape the future of education.
              </p>
            </div>
            <Link to="/about" className={styles.viewAll}>
              View all opportunities →
            </Link>
          </div>

          <div className={styles.partnersGrid}>
            <div className={styles.partnerCard}>
              <div className={styles.partnerIcon}>🏛️</div>
              <h3 className={styles.partnerTitle}>Admission Partner</h3>
              <p className={styles.partnerDesc}>
                Help students discover the right colleges and courses. Earn commissions for successful enrollments.
              </p>
              <Link to="/register" className={styles.partnerLink}>
                Become a partner →
              </Link>
            </div>

            <div className={styles.partnerCard}>
              <div className={styles.partnerIcon}>🎓</div>
              <h3 className={styles.partnerTitle}>Institute Representative</h3>
              <p className={styles.partnerDesc}>
                Represent your institution, manage enquiries, and connect with prospective students.
              </p>
              <Link to="/register" className={styles.partnerLink}>
                Join as rep →
              </Link>
            </div>

            <div className={styles.partnerCard}>
              <div className={styles.partnerIcon}>💡</div>
              <h3 className={styles.partnerTitle}>Counsellor / Advisor</h3>
              <p className={styles.partnerDesc}>
                Guide students with expert advice, build your profile, and earn rewards.
              </p>
              <Link to="/register" className={styles.partnerLink}>
                Apply now →
              </Link>
            </div>
          </div>
        </div>
      </section> */}
        <div className={styles.container}>
          <motion.div
            className={styles.ctaCard}
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} variants={fadeUp}
          >
            <p className={styles.ctaEyebrow}>Start Today — It's Free</p>
            <h2 className={styles.ctaTitle}>Ready to begin your journey?</h2>
            <p className={styles.ctaText}>
              Join 25,000+ students making informed decisions about their future.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.btnPrimary}>Create Free Account</Link>
              <Link to="/news"    className={styles.btnSecondary}>Read Our News & Articles</Link>
            </div>
          </motion.div>
        </div>
        {(!isAuthenticated || user?.role !== 'student') && (
          <div className={styles.partnerCta}>
            Are you an educator, counsellor, or institution?{' '}
            <Link to="/partner" className={styles.partnerCtaLink}>
              Join our Partner Program →
            </Link>
          </div>
        )}



      </section>
      
      
      <PredictorWidget />
      <LeadCapturePopup />

    </div>
  );
}
