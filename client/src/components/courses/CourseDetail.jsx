import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaGraduationCap, FaBook, FaRupeeSign, FaClipboardList, FaBullseye, FaClock } from 'react-icons/fa';
import { useCourseBySlug, useCollegesForCourse, useCourses } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import Button from '../common/Button/Button';
import CourseSyllabus from './CourseSyllabus';
import CourseCareerProspects from './CourseCareerProspects';
import styles from './CourseDetail.module.css';
import { formatCurrency } from '../../utils/formatters';
import { parseMarkdown } from '../../utils/parseMarkdown';
import SEOHead from '../common/SEOHead';

const SECTIONS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'syllabus',       label: 'Syllabus' },
  { id: 'career',         label: 'Career Prospects' },
  { id: 'specializations',label: 'Specializations' },
  { id: 'colleges',       label: 'Colleges' },
  { id: 'eligibility',    label: 'Eligibility & Exams' },
];

const CourseDetail = () => {
  const { slug } = useParams();
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef({});

  const { data: courseData, isLoading, error } = useCourseBySlug(slug);
  const course = courseData?.data?.data;
  const courseId = course?._id;

  const { data: collegesData, isLoading: collegesLoading } = useCollegesForCourse(courseId);
  const { data: similarCoursesData } = useCourses({
    discipline: course?.discipline,
    limit: 4,
  });

  const mappings = collegesData?.data?.data || [];
  const similarCourses = (similarCoursesData?.data?.data?.data || []).filter(c => c._id !== courseId).slice(0, 4);

  // IntersectionObserver — highlight active nav on scroll
  useEffect(() => {
    if (!course) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-15% 0% -70% 0%', threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [course]);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader size="lg" />
        <p>Loading course details…</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}><FaGraduationCap /></span>
        <h2>Course not found</h2>
        <p>We couldn't find a course at this URL.</p>
        <Link to="/courses"><Button variant="primary">Browse Courses</Button></Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SEOHead
        title={course?.name}
        description={course?.description || `${course?.name} — eligibility, fees, syllabus, career prospects and top colleges offering this course.`}
        keywords={`${course?.name}, ${course?.category} courses, ${course?.discipline}, admission 2025`}
        canonical={`https://campusgarh.com/courses/${course?.slug}`}
      />
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroNoise} />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/courses">Courses</Link>
            <span>/</span>
            <span>{course.name}</span>
          </nav>

          <div className={styles.heroBadges}>
            {course.category && <span className={styles.categoryBadge}>{course.category}</span>}
            {course.discipline && <span className={styles.disciplineBadge}>{course.discipline}</span>}
          </div>

          <h1 className={styles.name}>{course.name}</h1>

          <div className={styles.heroStats}>
            {course.duration && (
              <div className={styles.heroStat}>
                <span className={styles.heroStatIcon}><FaClock /></span>
                <span>{course.duration}</span>
              </div>
            )}
            {course.mode && (
              <div className={styles.heroStat}>
                <span className={styles.heroStatIcon}><FaBook /></span>
                <span>{course.mode}</span>
              </div>
            )}
            {(course.feeRange?.min || course.feeRange?.max) && (
              <div className={styles.heroStat}>
                <span className={styles.heroStatIcon}><FaRupeeSign /></span>
                <span>
                  {course.feeRange.min && course.feeRange.max
                    ? `${formatCurrency(course.feeRange.min)} – ${formatCurrency(course.feeRange.max)}`
                    : course.feeRange.min
                    ? `From ${formatCurrency(course.feeRange.min)}`
                    : `Up to ${formatCurrency(course.feeRange.max)}`}
                </span>
              </div>
            )}
            {course.admissionType && (
              <div className={styles.heroStat}>
                <span className={styles.heroStatIcon}><FaClipboardList /></span>
                <span>{course.admissionType}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STICKY NAV ────────────────────────────────────────────────────────── */}
      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar}>
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              className={`${styles.tabBtn} ${activeSection === sec.id ? styles.tabBtnActive : ''}`}
              onClick={() => scrollTo(sec.id)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ALL SECTIONS (always rendered, scroll-based) ───────────────────────── */}
      <div className={styles.contentWrap}>
        <div className={styles.content}>

          {/* OVERVIEW */}
          <div id="overview" ref={el => sectionRefs.current['overview'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Course Details</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Duration</span>
                  <span className={styles.infoCardValue}>{course.duration || 'N/A'}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Mode</span>
                  <span className={styles.infoCardValue}>{course.mode || 'Full-time'}</span>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardLabel}>Category</span>
                  <span className={styles.infoCardValue}>{course.category || 'N/A'}</span>
                </div>
                {course.discipline && (
                  <div className={styles.infoCard}>
                    <span className={styles.infoCardLabel}>Discipline</span>
                    <span className={styles.infoCardValue}>{course.discipline}</span>
                  </div>
                )}
                {course.admissionType && (
                  <div className={styles.infoCard}>
                    <span className={styles.infoCardLabel}>Admission Type</span>
                    <span className={styles.infoCardValue}>{course.admissionType}</span>
                  </div>
                )}
                {course.lateralEntry?.available && (
                  <div className={styles.infoCard}>
                    <span className={styles.infoCardLabel}>Lateral Entry</span>
                    <span className={styles.infoCardValue}>
                      Available{course.lateralEntry.intoYear ? ` (Year ${course.lateralEntry.intoYear})` : ''}
                    </span>
                    {course.lateralEntry.eligibility && (
                      <span className={styles.infoCardSub}>{course.lateralEntry.eligibility}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {course.description && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>About This Course</h2>
                <div
                  className={styles.descBox}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(course.description) }}
                />
              </div>
            )}

            {(course.feeRange?.min || course.feeRange?.max) && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Fee Range</h2>
                <div className={styles.feeCard}>
                  {course.feeRange.min && (
                    <div className={styles.feeStat}>
                      <span className={styles.feeLabel}>Minimum</span>
                      <span className={styles.feeValue}>{formatCurrency(course.feeRange.min)}</span>
                    </div>
                  )}
                  {course.feeRange.max && (
                    <div className={styles.feeStat}>
                      <span className={styles.feeLabel}>Maximum</span>
                      <span className={styles.feeValue}>{formatCurrency(course.feeRange.max)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SYLLABUS */}
          <div id="syllabus" ref={el => sectionRefs.current['syllabus'] = el} className={styles.section}>
            <CourseSyllabus syllabus={course.syllabus || []} />
          </div>

          {/* CAREER PROSPECTS */}
          <div id="career" ref={el => sectionRefs.current['career'] = el} className={styles.section}>
            <CourseCareerProspects course={course} />
          </div>

          {/* SPECIALIZATIONS */}
          <div id="specializations" ref={el => sectionRefs.current['specializations'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Available Specializations</h2>
              {course.specializations?.length > 0 ? (
                <div className={styles.specializationsGrid}>
                  {course.specializations.map((spec, idx) => (
                    <div key={idx} className={styles.specializationCard}>
                      <span className={styles.specIcon}><FaBullseye /></span>
                      <span className={styles.specName}>{spec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMsg}>No specializations listed for this course.</p>
              )}
            </div>
          </div>

          {/* COLLEGES */}
          <div id="colleges" ref={el => sectionRefs.current['colleges'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Colleges Offering This Course</h2>
              {collegesLoading ? (
                <Loader />
              ) : mappings.length > 0 ? (
                <div className={styles.collegesGrid}>
                  {mappings.map((mapping) => {
                    const college = mapping.college;
                    if (!college) return null;
                    return (
                      <Link key={college._id} to={`/colleges/${college.slug}`} className={styles.collegeCard}>
                        <h3 className={styles.collegeName}>{college.name}</h3>
                        {college.contact?.city && (
                          <p className={styles.collegeMeta}>📍 {college.contact.city}, {college.contact.state}</p>
                        )}
                        {mapping.fees && (
                          <p className={styles.collegeFee}>💰 {formatCurrency(mapping.fees)} / year</p>
                        )}
                        <div className={styles.collegeMetas}>
                          {college.collegeType && <span className={styles.collegeBadge}>{college.collegeType}</span>}
                          {college.accreditation?.naacGrade && <span className={styles.collegeBadge}>NAAC {college.accreditation.naacGrade}</span>}
                          {mapping.seatIntake && <span className={styles.collegeBadge}>{mapping.seatIntake} seats</span>}
                          {mapping.cutoff && <span className={styles.collegeBadge}>Cutoff: {mapping.cutoff}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.emptyMsg}>No colleges found for this course.</p>
              )}
            </div>
          </div>

          {/* ELIGIBILITY & EXAMS */}
          <div id="eligibility" ref={el => sectionRefs.current['eligibility'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Eligibility & Entrance Exams</h2>
              <div className={styles.eligibilityBox}>
                <h3 className={styles.eligibilityTitle}>Eligibility Criteria</h3>
                <p className={styles.eligibilityText}>{course.eligibility || 'As per university / institution norms.'}</p>
              </div>
              {course.entranceExamRequirements?.length > 0 && (
                <>
                  <h3 className={styles.subTitle}>Required Entrance Exams</h3>
                  <div className={styles.examsGrid}>
                    {course.entranceExamRequirements.map((exam, idx) => {
                      const isPopulated = exam && typeof exam === 'object' && exam.name;
                      return isPopulated ? (
                        <Link key={exam._id || idx} to={`/exams/${exam.slug}`} className={styles.examTagLink}>
                          📝 {exam.name}
                          {exam.category && <span className={styles.examTagCategory}>{exam.category}</span>}
                        </Link>
                      ) : (
                        <div key={idx} className={styles.examTag}>
                          📝 {typeof exam === 'string' ? exam : String(exam)}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SIMILAR COURSES */}
          {similarCourses.length > 0 && (
            <div className={styles.section}>
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Similar Courses</h2>
                <div className={styles.collegesGrid}>
                  {similarCourses.map(c => (
                    <Link key={c._id} to={`/courses/${c.slug}`} className={styles.collegeCard}>
                      <h3 className={styles.collegeName}>{c.name}</h3>
                      {c.category && <p className={styles.collegeMeta}>{c.category}</p>}
                      {c.duration && <p className={styles.collegeFee}>⏱ {c.duration}</p>}
                      <div className={styles.collegeMetas}>
                        {c.mode && <span className={styles.collegeBadge}>{c.mode}</span>}
                        {c.discipline && <span className={styles.collegeBadge}>{c.discipline}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
