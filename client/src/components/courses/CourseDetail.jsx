import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaGraduationCap, FaBook, FaRupeeSign, FaClipboardList, FaBullseye, FaClock } from 'react-icons/fa';
import { useCourseBySlug, useCollegesForCourse } from '../../hooks/queries';
import Loader from '../common/Loader/Loader';
import Button from '../common/Button/Button';
import CourseSyllabus from './CourseSyllabus';
import CourseCareerProspects from './CourseCareerProspects';
import styles from './CourseDetail.module.css';
import { formatCurrency } from '../../utils/formatters';

const TABS = ['Overview', 'Syllabus', 'Career Prospects', 'Specializations', 'Colleges', 'Eligibility & Exams'];

const CourseDetail = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const { data: courseData, isLoading, error } = useCourseBySlug(slug);

  const course = courseData?.data?.data;
  const courseId = course?._id;
  const { data: collegesData, isLoading: collegesLoading } = useCollegesForCourse(courseId);

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

  // collegesData is array of CollegeCourse mappings with populated college
  const mappings = collegesData?.data?.data || [];

  return (
    <div className={styles.page}>
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroNoise} />
        <div className={styles.heroInner}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/courses">Courses</Link>
            <span>/</span>
            <span>{course.name}</span>
          </nav>

          {/* Badges */}
          <div className={styles.heroBadges}>
            {course.category && (
              <span className={styles.categoryBadge}>{course.category}</span>
            )}
            {course.discipline && (
              <span className={styles.disciplineBadge}>{course.discipline}</span>
            )}
          </div>

          {/* Name */}
          <h1 className={styles.name}>{course.name}</h1>

          {/* Quick info strip */}
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

      {/* ── STICKY TAB BAR ────────────────────────────────────────────────────── */}
      <div className={styles.tabBarWrap}>
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────────── */}
      <div className={styles.contentWrap}>
        <div className={styles.content}>

          {/* OVERVIEW ───────────────────────────────────────────────────── */}
          {activeTab === 'Overview' && (
            <div className={styles.section}>
              {/* Quick stats */}
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
                  <div className={styles.descBox}>
                    <p style={{ margin: 0, lineHeight: '1.8' }}>{course.description}</p>
                  </div>
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
          )}

          {/* SYLLABUS ───────────────────────────────────────────────────── */}
          {activeTab === 'Syllabus' && (
            <CourseSyllabus syllabus={course.syllabus || []} />
          )}

          {/* CAREER PROSPECTS ───────────────────────────────────────────── */}
          {activeTab === 'Career Prospects' && (
            <CourseCareerProspects course={course} />
          )}

          {/* SPECIALIZATIONS ────────────────────────────────────────────── */}
          {activeTab === 'Specializations' && (
            <div className={styles.section}>
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
          )}

          {/* COLLEGES ───────────────────────────────────────────────────── */}
          {activeTab === 'Colleges' && (
            <div className={styles.section}>
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
                        <Link
                          key={college._id}
                          to={`/colleges/${college.slug}`}
                          className={styles.collegeCard}
                        >
                          <h3 className={styles.collegeName}>{college.name}</h3>
                          {college.contact?.city && (
                            <p className={styles.collegeMeta}>
                              📍 {college.contact.city}, {college.contact.state}
                            </p>
                          )}
                          {mapping.fees && (
                            <p className={styles.collegeFee}>
                              💰 {formatCurrency(mapping.fees)} / year
                            </p>
                          )}
                          <div className={styles.collegeMetas}>
                            {college.collegeType && (
                              <span className={styles.collegeBadge}>{college.collegeType}</span>
                            )}
                            {college.accreditation?.naacGrade && (
                              <span className={styles.collegeBadge}>
                                NAAC {college.accreditation.naacGrade}
                              </span>
                            )}
                            {mapping.seatIntake && (
                              <span className={styles.collegeBadge}>
                                {mapping.seatIntake} seats
                              </span>
                            )}
                            {mapping.cutoff && (
                              <span className={styles.collegeBadge}>
                                Cutoff: {mapping.cutoff}
                              </span>
                            )}
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
          )}

          {/* ELIGIBILITY & EXAMS ────────────────────────────────────────── */}
          {activeTab === 'Eligibility & Exams' && (
            <div className={styles.section}>
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Eligibility & Entrance Exams</h2>

                <div className={styles.eligibilityBox}>
                  <h3 className={styles.eligibilityTitle}>Eligibility Criteria</h3>
                  <p className={styles.eligibilityText}>
                    {course.eligibility || 'As per university / institution norms.'}
                  </p>
                </div>

                {course.entranceExamRequirements?.length > 0 && (
                  <>
                    <h3 className={styles.subTitle}>Required Entrance Exams</h3>
                    <div className={styles.examsGrid}>
                      {course.entranceExamRequirements.map((exam, idx) => {
                        const isPopulated = exam && typeof exam === 'object' && exam.name;
                        return isPopulated ? (
                          <Link
                            key={exam._id || idx}
                            to={`/exams/${exam.slug}`}
                            className={styles.examTagLink}
                          >
                            📝 {exam.name}
                            {exam.category && (
                              <span className={styles.examTagCategory}>{exam.category}</span>
                            )}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
