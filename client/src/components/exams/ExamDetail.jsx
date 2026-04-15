import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useExamBySlug, useCoursesForExam, useExams } from '../../hooks/queries';
import { formatDate, formatCurrency } from '../../utils/formatters';
import Loader from '../common/Loader/Loader';
import Button from '../common/Button/Button';
import styles from './ExamDetail.module.css';
import { FaBook, FaExternalLinkAlt, FaFileAlt, FaUniversity, FaLaptop, FaCalendarAlt, FaMapPin } from 'react-icons/fa';
import SEOHead from '../common/SEOHead';

const SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'eligibility',label: 'Eligibility' },
  { id: 'pattern',    label: 'Pattern & Syllabus' },
  { id: 'dates',      label: 'Dates & Cutoffs' },
  { id: 'preparation',label: 'Preparation' },
  { id: 'registration',label: 'Registration' },
];

const ExamDetail = () => {
  const { slug } = useParams();
  const { data: examRes, isLoading, error } = useExamBySlug(slug);
  const exam = examRes?.data?.data;

  const { data: coursesRes } = useCoursesForExam(exam?._id);
  const { data: similarExamsData } = useExams({ category: exam?.category, limit: 5 });

  const [activeSection, setActiveSection] = useState('overview');
  const [showFullSyllabus, setShowFullSyllabus] = useState(false);
  const sectionRefs = useRef({});

  const courses = coursesRes?.data?.data || [];
  const similarExams = (similarExamsData?.data?.data?.data || []).filter(e => e._id !== exam?._id).slice(0, 4);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // IntersectionObserver — highlight active nav on scroll
  useEffect(() => {
    if (!exam) return;
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
  }, [exam]);

  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader size="lg" />
        <p>Loading exam details…</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorIcon}><FaFileAlt /></span>
        <h2>Exam not found</h2>
        <p>We couldn't find an exam at this URL.</p>
        <Link to="/exams"><Button variant="primary">Browse Exams</Button></Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SEOHead
        title={exam?.name}
        description={exam?.description || `${exam?.name} — exam dates, eligibility, pattern, syllabus and cutoffs for 2025.`}
        keywords={`${exam?.name}, ${exam?.category} exam, ${exam?.name} 2025, entrance exam India`}
        canonical={`https://campusgarh.com/exams/${exam?.slug}`}
      />
      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroNoise} />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/exams">Exams</Link>
            <span>/</span>
            <span>{exam.name}</span>
          </nav>

          <div className={styles.heroBadges}>
            {exam.category && <span className={styles.categoryBadge}>{exam.category}</span>}
            {exam.examLevel && <span className={styles.levelBadge}>{exam.examLevel}</span>}
          </div>

          <h1 className={styles.name}>{exam.name}</h1>

          <div className={styles.heroStats}>
            {exam.conductingBody && (
              <div className={styles.heroStat}><span><FaUniversity /></span><span>{exam.conductingBody}</span></div>
            )}
            {exam.examMode && (
              <div className={styles.heroStat}><span><FaLaptop /></span><span>{exam.examMode}</span></div>
            )}
            {exam.frequency && (
              <div className={styles.heroStat}><span><FaCalendarAlt /></span><span>{exam.frequency}</span></div>
            )}
            {exam.importantDates?.find(d => d.event === 'Exam Date') && (
              <div className={styles.heroStat}>
                <span><FaMapPin /></span>
                <span>{formatDate(exam.importantDates.find(d => d.event === 'Exam Date').date)}</span>
              </div>
            )}
          </div>

          <div className={styles.heroActions}>
            {exam.officialWebsite && (
              <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
                Official Website <FaExternalLinkAlt />
              </a>
            )}
            {exam.registrationLink && (
              <a href={exam.registrationLink} target="_blank" rel="noopener noreferrer" className={styles.ctaBtnOutline}>
                Registration Portal
              </a>
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
              <h2 className={styles.sectionTitle}>About {exam.name}</h2>
              <div className={styles.overviewBox}>{exam.overview || 'No overview provided.'}</div>
              <div className={styles.keyInfoGrid}>
                {exam.conductingBody && (
                  <div className={styles.keyInfoCard}>
                    <span className={styles.keyInfoLabel}>Conducting Body</span>
                    <span className={styles.keyInfoValue}>{exam.conductingBody}</span>
                  </div>
                )}
                {exam.examLevel && (
                  <div className={styles.keyInfoCard}>
                    <span className={styles.keyInfoLabel}>Exam Level</span>
                    <span className={styles.keyInfoValue}>{exam.examLevel}</span>
                  </div>
                )}
                {exam.frequency && (
                  <div className={styles.keyInfoCard}>
                    <span className={styles.keyInfoLabel}>Frequency</span>
                    <span className={styles.keyInfoValue}>{exam.frequency}</span>
                  </div>
                )}
                {exam.examMode && (
                  <div className={styles.keyInfoCard}>
                    <span className={styles.keyInfoLabel}>Exam Mode</span>
                    <span className={styles.keyInfoValue}>{exam.examMode}</span>
                  </div>
                )}
                {exam.totalApplications && (
                  <div className={styles.keyInfoCard}>
                    <span className={styles.keyInfoLabel}>Applications</span>
                    <span className={styles.keyInfoValue}>{exam.totalApplications.toLocaleString('en-IN')}+</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ELIGIBILITY */}
          <div id="eligibility" ref={el => sectionRefs.current['eligibility'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Eligibility Criteria</h2>
              <div className={styles.eligibilityBox}>
                {exam.eligibility ? (
                  <p style={{ margin: 0 }}>{exam.eligibility}</p>
                ) : exam.eligibilityDetails ? (
                  <>
                    {exam.eligibilityDetails.minAge && <p><strong>Minimum Age:</strong> {exam.eligibilityDetails.minAge} years</p>}
                    {exam.eligibilityDetails.maxAge && <p><strong>Maximum Age:</strong> {exam.eligibilityDetails.maxAge} years</p>}
                    {exam.eligibilityDetails.qualifyingExam && <p><strong>Qualifying Exam:</strong> {exam.eligibilityDetails.qualifyingExam}</p>}
                    {exam.eligibilityDetails.minPercentageGeneral && <p><strong>Min % (General):</strong> {exam.eligibilityDetails.minPercentageGeneral}%</p>}
                    {exam.eligibilityDetails.minPercentageOBC && <p><strong>Min % (OBC):</strong> {exam.eligibilityDetails.minPercentageOBC}%</p>}
                    {exam.eligibilityDetails.minPercentageSC_ST && <p><strong>Min % (SC/ST):</strong> {exam.eligibilityDetails.minPercentageSC_ST}%</p>}
                    {exam.eligibilityDetails.numberOfAttempts && <p><strong>No. of Attempts:</strong> {exam.eligibilityDetails.numberOfAttempts}</p>}
                    {exam.eligibilityDetails.otherCriteria?.length > 0 && (
                      <>
                        <p><strong>Other Criteria:</strong></p>
                        <ul>{exam.eligibilityDetails.otherCriteria.map((c, i) => <li key={i}>{c}</li>)}</ul>
                      </>
                    )}
                  </>
                ) : (
                  <p style={{ margin: 0 }}>Eligibility details not available.</p>
                )}
              </div>
            </div>
          </div>

          {/* PATTERN & SYLLABUS */}
          <div id="pattern" ref={el => sectionRefs.current['pattern'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Exam Pattern</h2>
              <div className={styles.patternCards}>
                {exam.examPattern?.duration && (
                  <div className={styles.patternCard}>
                    <span className={styles.patternCardLabel}>Duration</span>
                    <span className={styles.patternCardValue}>{exam.examPattern.duration}</span>
                  </div>
                )}
                {exam.examPattern?.totalMarks && (
                  <div className={styles.patternCard}>
                    <span className={styles.patternCardLabel}>Total Marks</span>
                    <span className={styles.patternCardValue}>{exam.examPattern.totalMarks}</span>
                  </div>
                )}
                {exam.examMode && (
                  <div className={styles.patternCard}>
                    <span className={styles.patternCardLabel}>Exam Mode</span>
                    <span className={styles.patternCardValue}>{exam.examMode}</span>
                  </div>
                )}
              </div>

              {exam.sectionDetails?.length > 0 && (
                <>
                  <h3 className={styles.subTitle}>Sections</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.sectionTable}>
                      <thead>
                        <tr><th>Section</th><th>Questions</th><th>Marks</th><th>Time</th></tr>
                      </thead>
                      <tbody>
                        {exam.sectionDetails.map((sec, idx) => (
                          <tr key={idx}>
                            <td>{sec.name}</td><td>{sec.totalQuestions}</td>
                            <td>{sec.maxMarks}</td><td>{sec.timeAllotted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {exam.examPattern?.markingScheme && (
                <div className={styles.markingScheme}>
                  <h3 className={styles.subTitle}>Marking Scheme</h3>
                  <p style={{ margin: 0 }}>{exam.examPattern.markingScheme}</p>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Syllabus</h2>
              <div className={styles.syllabusBox}>
                {exam.syllabus ? (
                  <>
                    <div dangerouslySetInnerHTML={{
                      __html: showFullSyllabus
                        ? exam.syllabus
                        : exam.syllabus.substring(0, 500) + (exam.syllabus.length > 500 ? '...' : ''),
                    }} />
                    {exam.syllabus.length > 500 && (
                      <button className={styles.readMoreBtn} onClick={() => setShowFullSyllabus(!showFullSyllabus)}>
                        {showFullSyllabus ? '↑ Show less' : '↓ Read more'}
                      </button>
                    )}
                  </>
                ) : (
                  <p style={{ margin: 0 }}>Syllabus details not available.</p>
                )}
              </div>
            </div>
          </div>

          {/* DATES & CUTOFFS */}
          <div id="dates" ref={el => sectionRefs.current['dates'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Important Dates</h2>
              {exam.importantDates?.length > 0 ? (
                <div className={styles.datesTimeline}>
                  {exam.importantDates.map((item, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineEvent}>{item.event}</div>
                        <div className={styles.timelineDate}>{formatDate(item.date)}</div>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.timelineLink}>
                            Official Notification <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMsg}>No important dates announced yet.</p>
              )}
            </div>

            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Cutoffs (Previous Years)</h2>
              {exam.examCutoffs?.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.sectionTable}>
                    <thead>
                      <tr><th>Year</th><th>Category</th><th>Cutoff Score</th><th>Cutoff Rank</th></tr>
                    </thead>
                    <tbody>
                      {exam.examCutoffs.map((cut, idx) => (
                        <tr key={idx}>
                          <td>{cut.year}</td><td>{cut.category}</td>
                          <td>{cut.cutoffScore || '—'}</td><td>{cut.cutoffRank || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.emptyMsg}>No cutoff data available.</p>
              )}
            </div>
          </div>

          {/* PREPARATION */}
          <div id="preparation" ref={el => sectionRefs.current['preparation'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Preparation Tips</h2>
              {exam.preparationTips?.length > 0 ? (
                <div className={styles.tipsGrid}>
                  {exam.preparationTips.map((tip, idx) => (
                    <div key={idx} className={styles.tipCard}>
                      <div className={styles.tipCategory}>{tip.category}</div>
                      <p style={{ margin: 0 }}>{tip.tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyMsg}>No preparation tips available.</p>
              )}
            </div>

            {exam.recommendedBooks?.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Recommended Books</h2>
                <div className={styles.booksGrid}>
                  {exam.recommendedBooks.map((book, idx) => (
                    <div key={idx} className={styles.bookCard}>
                      <div className={styles.bookIcon}><FaBook /></div>
                      <div>
                        <div className={styles.bookTitle}>{book.title}</div>
                        <div className={styles.bookAuthor}>{book.author}</div>
                        <div className={styles.bookSubject}>{book.subject}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* REGISTRATION */}
          <div id="registration" ref={el => sectionRefs.current['registration'] = el} className={styles.section}>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Registration Details</h2>

              {(exam.registrationFee || exam.registrationFeeDetails) && (
                <>
                  {exam.registrationFee && (
                    <div className={styles.infoCards}>
                      <div className={styles.infoCard}>
                        <span className={styles.infoLabel}>Application Fee</span>
                        <span className={styles.infoValue}>{formatCurrency(exam.registrationFee)}</span>
                      </div>
                    </div>
                  )}
                  {exam.registrationFeeDetails && (
                    <div className={styles.feeTable}>
                      {exam.registrationFeeDetails.general && <div className={styles.feeRow}><span>General</span><span>{formatCurrency(exam.registrationFeeDetails.general)}</span></div>}
                      {exam.registrationFeeDetails.obc && <div className={styles.feeRow}><span>OBC</span><span>{formatCurrency(exam.registrationFeeDetails.obc)}</span></div>}
                      {exam.registrationFeeDetails.sc_st && <div className={styles.feeRow}><span>SC/ST</span><span>{formatCurrency(exam.registrationFeeDetails.sc_st)}</span></div>}
                      {exam.registrationFeeDetails.female && <div className={styles.feeRow}><span>Female</span><span>{formatCurrency(exam.registrationFeeDetails.female)}</span></div>}
                      {exam.registrationFeeDetails.pwd && <div className={styles.feeRow}><span>PwD</span><span>{formatCurrency(exam.registrationFeeDetails.pwd)}</span></div>}
                    </div>
                  )}
                </>
              )}

              {exam.registrationSteps?.length > 0 && (
                <>
                  <h3 className={styles.subTitle}>Registration Steps</h3>
                  <ol className={styles.stepsList}>
                    {exam.registrationSteps.map((step, idx) => <li key={idx}>{step}</li>)}
                  </ol>
                </>
              )}

              {exam.documentsRequired?.length > 0 && (
                <>
                  <h3 className={styles.subTitle}>Documents Required</h3>
                  <div className={styles.tagRow}>
                    {exam.documentsRequired.map((doc, idx) => (
                      <span key={idx} className={styles.docTag}>{doc}</span>
                    ))}
                  </div>
                </>
              )}

              {exam.officialWebsite && (
                <div className={styles.linkBox}>
                  <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                    Visit Official Website <FaExternalLinkAlt />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* COLLEGES ACCEPTING THIS EXAM */}
          {courses.length > 0 && (
            <div className={styles.section}>
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Colleges Accepting {exam.name}</h2>
                <div className={styles.collegesGrid}>
                  {courses.map(course => (
                    <Link to={`/colleges/${course.college?.slug}`} key={course._id} className={styles.collegeCard}>
                      <div className={styles.collegeName}>{course.college?.name}</div>
                      <div className={styles.collegeMeta}>
                        {course.course?.name}{course.fees ? ` · ${formatCurrency(course.fees)}` : ''}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SIMILAR EXAMS */}
          {similarExams.length > 0 && (
            <div className={styles.section}>
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Similar Exams</h2>
                <div className={styles.collegesGrid}>
                  {similarExams.map(e => (
                    <Link key={e._id} to={`/exams/${e.slug}`} className={styles.collegeCard}>
                      <div className={styles.collegeName}>{e.name}</div>
                      {e.conductingBody && <div className={styles.collegeMeta}>{e.conductingBody}</div>}
                      <div className={styles.collegeMetas}>
                        {e.examLevel && <span className={styles.collegeBadge}>{e.examLevel}</span>}
                        {e.examMode && <span className={styles.collegeBadge}>{e.examMode}</span>}
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

export default ExamDetail;
