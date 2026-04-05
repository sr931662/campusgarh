import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FaBolt, FaRobot, FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaUniversity, FaGraduationCap, FaFileAlt,
} from 'react-icons/fa';
import { predictorService } from '../services/predictorService';
import Loader from '../components/common/Loader/Loader';
import CollegeSearchInput from '../components/predictor/CollegeSearchInput';
import CourseSearchInput from '../components/predictor/CourseSearchInput';
import styles from './Predictor.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const STREAMS = [
  '', 'Engineering & Technology', 'Medical & Health Sciences', 'Management & Business',
  'Law', 'Arts & Science', 'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts', 'Commerce & Finance', 'Technical', 'Multi-Disciplinary',
];
const LEVELS     = ['', 'UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'PwD'];
const STATES = [
  '', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Andhra Pradesh',
  'Punjab', 'Haryana', 'Kerala', 'Bihar', 'Odisha', 'Assam',
];

const BAR_COLOR  = { green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444' };
const TREND_COLOR = { getting_harder: '#ef4444', getting_easier: '#22c55e', stable: '#3b82f6', insufficient_data: '#94a3b8' };

const fmt    = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : null;
const fmtLPA = (n) => { if (n == null) return '—'; const v = Number(n); return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} LPA`; };
const fmtNum = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—';

// ─── Shared UI ────────────────────────────────────────────────────────────────

const ChanceMeter = ({ chance, color, bucket }) => (
  <div className={styles.chanceMeter}>
    <div className={styles.chanceTop}>
      <span className={`${styles.chanceBadge} ${styles[color]}`}>{bucket}</span>
      <span className={styles.chanceNum}>{chance}%</span>
    </div>
    <div className={styles.chanceBar}>
      <div className={styles.chanceBarFill} style={{ width: `${chance}%`, background: BAR_COLOR[color] || '#9ca3af' }} />
    </div>
  </div>
);

// ─── Browse: College Card ─────────────────────────────────────────────────────

const CollegeCard = ({ item }) => (
  <div className={styles.resultCard}>
    <ChanceMeter chance={item.chance} color={item.color} bucket={item.bucket} />
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>
      {item.contact?.city}{item.contact?.state ? `, ${item.contact.state}` : ''} · {item.collegeType || 'College'}
    </p>
    <div className={styles.cardDetails}>
      {item.accreditation?.nirfRank    && <span className={styles.detail}>NIRF #{item.accreditation.nirfRank}</span>}
      {item.accreditation?.naacGrade   && <span className={styles.detail}>NAAC {item.accreditation.naacGrade}</span>}
      {fmt(item.fees?.total)           && <span className={styles.detail}>{fmt(item.fees.total)}/yr</span>}
      {item.placementStats?.placementPercentage && (
        <span className={styles.detail}>{item.placementStats.placementPercentage}% Placed</span>
      )}
      {item.lastYearClosingRank && (
        <span className={`${styles.detail} ${styles.cutoffDetail}`}>
          Closing rank: {fmtNum(item.lastYearClosingRank)}
        </span>
      )}
    </div>
    <span className={item.hasRealData ? styles.realDataBadge : styles.estimateBadge}>
      {item.hasRealData ? <><FaCheckCircle /> Actual cutoff data</> : '~ NIRF estimate'}
    </span>
    <Link to={`/colleges/${item.slug}`} className={styles.cardLink}>View College →</Link>
  </div>
);

// ─── Detailed Analysis Card ───────────────────────────────────────────────────

const DetailedAnalysisCard = ({ data }) => {
  if (!data) return null;
  const {
    college, course, yearWiseCutoffs, trend, trendLabel,
    chance, color, bucket, reasoning, candidateRank,
    placements, hasRealData, dataSource,
    seatIntake, fees, eligibility, examsRequired,
  } = data;

  return (
    <div className={styles.detailCard}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div>
          <h2 className={styles.detailCollegeName}>{college?.name}</h2>
          <p className={styles.detailCourseName}>
            {course?.name} · {course?.category} · {course?.discipline}
          </p>
          <p className={styles.detailMeta}>
            {college?.contact?.city}, {college?.contact?.state} · {college?.collegeType}
          </p>
        </div>
        <div className={styles.detailBadges}>
          {college?.accreditation?.nirfRank  && <span className={styles.detail}>NIRF #{college.accreditation.nirfRank}</span>}
          {college?.accreditation?.naacGrade && <span className={styles.detail}>NAAC {college.accreditation.naacGrade}</span>}
        </div>
      </div>

      {/* Chance + meta */}
      <div className={styles.detailChanceRow}>
        <div className={styles.detailChanceBlock}>
          <ChanceMeter chance={chance} color={color} bucket={bucket} />
          <p className={styles.reasoning}>{reasoning}</p>
          <span className={hasRealData ? styles.realDataBadge : styles.estimateBadge}>{dataSource}</span>
        </div>
        <div className={styles.detailMetaBlock}>
          {candidateRank && <div className={styles.metaItem}><span>Your Rank</span><strong>{fmtNum(candidateRank)}</strong></div>}
          {seatIntake    && <div className={styles.metaItem}><span>Seat Intake</span><strong>{seatIntake}</strong></div>}
          {fees          && <div className={styles.metaItem}><span>Fees/yr</span><strong>{fmt(fees)}</strong></div>}
          {eligibility   && <div className={styles.metaItem}><span>Eligibility</span><strong>{eligibility}</strong></div>}
          {examsRequired?.length > 0 && (
            <div className={styles.metaItem}>
              <span>Exams Required</span>
              <strong>{examsRequired.map(e => e.name).join(', ')}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Trend */}
      {trend && trend !== 'insufficient_data' && (
        <div className={styles.trendBadge} style={{ color: TREND_COLOR[trend], borderColor: TREND_COLOR[trend] }}>
          Cutoff Trend: <strong>{trendLabel}</strong>
        </div>
      )}

      {/* Year-wise cutoff table */}
      {yearWiseCutoffs?.length > 0 ? (
        <div className={styles.cutoffSection}>
          <h3 className={styles.sectionTitle}>
            Last {yearWiseCutoffs.length} Year{yearWiseCutoffs.length > 1 ? 's' : ''} Cutoff History
          </h3>
          <div className={styles.cutoffTable}>
            <div className={styles.cutoffHead}>
              <span>Year</span><span>Opening Rank</span><span>Closing Rank</span>
              <span>Category</span><span>Your Result</span>
            </div>
            {yearWiseCutoffs.map((row, i) => (
              <div key={i} className={styles.cutoffRow}>
                <span className={styles.cutoffYear}>{row.year}</span>
                <span>{fmtNum(row.openingRank)}</span>
                <span className={styles.closingRank}>{fmtNum(row.closingRank)}</span>
                <span>{row.category || '—'}</span>
                <span className={row.result?.includes('NOT') ? styles.cutoffFail : row.result ? styles.cutoffPass : ''}>
                  {row.result || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className={styles.noCutoff}>
          No cutoff history in the database for this college-course yet. Showing NIRF estimate only.
        </p>
      )}

      {/* Placement trend */}
      {placements?.length > 0 && (
        <div className={styles.placementSection}>
          <h3 className={styles.sectionTitle}>Placement Trend</h3>
          <div className={styles.cutoffTable}>
            <div className={styles.cutoffHead}>
              <span>Year</span><span>Avg Package</span><span>Highest Package</span><span>Placement %</span>
            </div>
            {placements.map((p, i) => (
              <div key={i} className={styles.cutoffRow}>
                <span className={styles.cutoffYear}>{p.year}</span>
                <span>{fmtLPA(p.averagePackage)}</span>
                <span>{fmtLPA(p.highestPackage)}</span>
                <span>{p.placementPercentage != null ? `${p.placementPercentage}%` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Link to={`/colleges/${college?.slug}`} className={styles.detailViewBtn}>
        View Full College Profile →
      </Link>
    </div>
  );
};

// ─── Course Card ──────────────────────────────────────────────────────────────

const CourseCard = ({ item }) => (
  <div className={styles.resultCard}>
    <ChanceMeter chance={item.chance} color={item.color} bucket={item.bucket} />
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>{item.category} · {item.discipline || 'General'}</p>
    <div className={styles.cardDetails}>
      {item.duration && <span className={styles.detail}>{item.duration}</span>}
      {item.mode     && <span className={styles.detail}>{item.mode}</span>}
      {item.feeRange?.min && <span className={styles.detail}>{fmt(item.feeRange.min)} – {fmt(item.feeRange.max)}</span>}
    </div>
    <Link to={`/courses/${item.slug}`} className={styles.cardLink}>View Course →</Link>
  </div>
);

// ─── Exam Card ────────────────────────────────────────────────────────────────

const ExamCard = ({ item }) => (
  <div className={styles.resultCard}>
    <ChanceMeter chance={item.chance} color={item.color} bucket={item.bucket} />
    {item.isRequired && (
      <span className={styles.realDataBadge} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
        Required by your target college/course
      </span>
    )}
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>{item.category} · {item.examLevel || 'Entrance Exam'}</p>
    <div className={styles.cardDetails}>
      {item.conductingBody  && <span className={styles.detail}>{item.conductingBody}</span>}
      {item.examMode        && <span className={styles.detail}>{item.examMode}</span>}
      {item.frequency       && <span className={styles.detail}>{item.frequency}</span>}
      {item.registrationFee && <span className={styles.detail}>Fee ₹{item.registrationFee}</span>}
    </div>
    <Link to={`/exams/${item.slug}`} className={styles.cardLink}>View Exam →</Link>
  </div>
);

// ─── Score Inputs (outside Predictor to prevent remount on every keystroke) ───

const ScoreInputs = ({
  form, setForm,
  useRankOrPct, setUseRankOrPct,
  cgpa, setCgpa,
  highestQualification, setHQual,
  yearOfPassing, setYearOfPassing,
  instituteName, setInstituteName,
}) => (
  <>
    <div className={styles.field}>
      <label>Score Type</label>
      <select value={useRankOrPct} onChange={e => setUseRankOrPct(e.target.value)}>
        <option value="percentile">Percentile</option>
        <option value="rank">Exam Rank</option>
        <option value="cgpa">CGPA (10-pt scale)</option>
        <option value="percentage">Percentage</option>
      </select>
    </div>

    <div className={styles.field}>
      <label>
        {useRankOrPct === 'cgpa'       ? 'Your CGPA'       :
         useRankOrPct === 'rank'       ? 'Your Rank'       :
         useRankOrPct === 'percentile' ? 'Your Percentile' : 'Your Percentage'}
      </label>
      <input
        type="number"
        placeholder={useRankOrPct === 'cgpa' ? 'e.g. 8.5' : useRankOrPct === 'rank' ? 'e.g. 15000' : 'e.g. 92.5'}
        value={useRankOrPct === 'cgpa' ? cgpa : useRankOrPct === 'rank' ? form.rank : form.percentile}
        onChange={e => {
          if      (useRankOrPct === 'cgpa') setCgpa(e.target.value);
          else if (useRankOrPct === 'rank') setForm(p => ({ ...p, rank: e.target.value }));
          else                              setForm(p => ({ ...p, percentile: e.target.value }));
        }}
      />
    </div>

    <div className={styles.field}>
      <label>Highest Qualification</label>
      <select value={highestQualification} onChange={e => setHQual(e.target.value)}>
        <option value="10th">10th</option>
        <option value="12th">12th / HSC</option>
        <option value="Diploma">Diploma</option>
        <option value="UG">Graduation (UG)</option>
        <option value="PG">Post-Graduation (PG)</option>
      </select>
    </div>

    <div className={styles.field}>
      <label>Year of Passing</label>
      <select value={yearOfPassing} onChange={e => setYearOfPassing(e.target.value)}>
        <option value="">Select Year</option>
        {[...Array(7)].map((_, i) => {
          const y = new Date().getFullYear() - i;
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>
    </div>

    <div className={styles.field}>
      <label>Institute / School Name (optional)</label>
      <input
        type="text"
        placeholder="e.g. DPS Noida, IIT Roorkee"
        value={instituteName}
        onChange={e => setInstituteName(e.target.value)}
      />
    </div>
  </>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Predictor = () => {
  const [cgpa, setCgpa]                           = useState('');
  const [useRankOrPct, setUseRankOrPct]           = useState('percentile'); // 'percentile'|'rank'|'cgpa'
  const [yearOfPassing, setYearOfPassing]         = useState('');
  const [instituteName, setInstituteName]         = useState('');
  const [examRank, setExamRank]                   = useState('');
  const [highestQualification, setHQual]          = useState('12th');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState(''); // 'unavailable' | 'failed' | ''


  const [type, setType]       = useState('college');
  // College browse — sort
  const [collegeSort, setCollegeSort] = useState('chance'); // 'chance'|'nirf'|'fees'|'placement'

  // Course tab modes
  const [courseMode, setCourseMode] = useState('recommend'); // 'recommend'|'specific'
  const [cfForm,  setCfForm]  = useState({ courseId: '', courseName: '', percentile: '', rank: '', cgpa: '', category: 'General' });

  // Exam tab modes
  const [examMode, setExamMode] = useState('recommend'); // 'recommend'|'map'
  const [mapCourseId,   setMapCourseId]   = useState('');
  const [mapCourseName, setMapCourseName] = useState('');

  const [mode, setMode]       = useState('browse');  // 'browse' | 'analyze'
  const [triggered, setTriggered] = useState(false);

  const [cForm,  setCForm]  = useState({ percentile: '', rank: '', stream: '', state: '', maxFee: '', category: 'General' });
  const [aForm,  setAForm]  = useState({ percentile: '', rank: '', category: 'General', collegeId: '', courseId: '' });
  const [crForm, setCrForm] = useState({ percentage: '', cgpa: '', level: '', discipline: '', highestQualification: '12th', interests: [] });
  const [eForm,  setEForm]  = useState({ discipline: '', level: '', targetCollegeIds: [], targetCourseIds: [] });

  // ── Queries ─────────────────────────────────────────────────────────────────

  const { data: cData,  isLoading: cLoading,  refetch: cRefetch  } = useQuery({
    queryKey: ['predict-colleges', cForm, useRankOrPct, cgpa, examRank, highestQualification, yearOfPassing, instituteName],
    queryFn: () => {
      const params = {
        ...(useRankOrPct === 'percentile' && cForm.percentile && { percentile: cForm.percentile }),
        ...(useRankOrPct === 'rank'       && cForm.rank       && { rank: cForm.rank }),
        ...(useRankOrPct === 'cgpa'       && cgpa             && { cgpa }),
        ...(useRankOrPct === 'percentage' && cForm.percentile && { percentage: cForm.percentile }),
        ...(examRank      && { examRank }),
        ...(cForm.stream  && { stream: cForm.stream }),
        ...(cForm.state   && { state: cForm.state }),
        ...(cForm.maxFee  && { maxFee: cForm.maxFee }),
        category: cForm.category,
        highestQualification,
        ...(yearOfPassing  && { yearOfPassing }),
        ...(instituteName  && { instituteName }),
        limit: 30,
      };
      return predictorService.predictColleges(params);
    },
    enabled: false,
  });

  const { data: aData,  isLoading: aLoading,  refetch: aRefetch  } = useQuery({
    queryKey: ['predict-college-detail', aForm, useRankOrPct, cgpa, highestQualification, yearOfPassing],
    queryFn: () => {
      const params = {
        ...(useRankOrPct === 'percentile' && aForm.percentile && { percentile: aForm.percentile }),
        ...(useRankOrPct === 'rank'       && aForm.rank       && { rank: aForm.rank }),
        ...(useRankOrPct === 'cgpa'       && cgpa             && { cgpa }),
        collegeId: aForm.collegeId || undefined,
        courseId:  aForm.courseId  || undefined,
        category:  aForm.category,
        highestQualification,
        ...(yearOfPassing && { yearOfPassing }),
      };
      return predictorService.getCollegeDetailedAnalysis(params);
    },
    enabled: false,
  });

  const { data: crData, isLoading: crLoading, refetch: crRefetch } = useQuery({
    queryKey: ['predict-courses', crForm],
    queryFn: () => {
      const scoreVal = Number(crForm.cgpa || crForm.percentage || 0);
      const params = {
        ...(crForm.cgpa       && scoreVal <= 10  ? { cgpa: crForm.cgpa }             : {}),
        ...(crForm.percentage && scoreVal >  10  ? { percentage: crForm.percentage } : {}),
        level:                 crForm.level      || undefined,
        discipline:            crForm.discipline || undefined,
        highestQualification:  crForm.highestQualification,
        ...(crForm.interests.length && { interests: crForm.interests.join(',') }),
        limit: 30,
      };
      return predictorService.predictCourses(params);
    },
    enabled: false,
  });

  const { data: eData,  isLoading: eLoading,  refetch: eRefetch  } = useQuery({
    queryKey: ['predict-exams', eForm],
    queryFn: () => {
      const params = {
        discipline:      eForm.discipline || undefined,
        level:           eForm.level      || undefined,
        ...(eForm.targetCollegeIds.length && { targetCollegeIds: eForm.targetCollegeIds.map(c => c.id).join(',') }),
        ...(eForm.targetCourseIds.length  && { targetCourseIds:  eForm.targetCourseIds.map(c => c.id).join(',') }),
        limit: 20,
      };
      return predictorService.predictExams(params);
    },
    enabled: false,
  });

  // ── Actions ─────────────────────────────────────────────────────────────────
  const { data: cfData, isLoading: cfLoading, refetch: cfRefetch } = useQuery({
    queryKey: ['predict-colleges-for-course', cfForm],
    queryFn: () => predictorService.predictCollegesForCourse({
      courseId:    cfForm.courseId,
      ...(cfForm.cgpa        && { cgpa:       cfForm.cgpa }),
      ...(cfForm.percentile  && { percentile: cfForm.percentile }),
      ...(cfForm.rank        && { rank:       cfForm.rank }),
      category:    cfForm.category,
      limit: 30,
    }),
    enabled: false,
  });

  const { data: emData, isLoading: emLoading, refetch: emRefetch } = useQuery({
    queryKey: ['exam-college-map', mapCourseId],
    queryFn: () => predictorService.getExamCollegeMap({ courseId: mapCourseId }),
    enabled: false,
  });

  const handlePredict = () => {
    setTriggered(true);
    if      (type === 'college' && mode === 'analyze')                          aRefetch();
    else if (type === 'college')                                                 cRefetch();
    else if (type === 'course'  && courseMode === 'specific' && cfForm.courseId) cfRefetch();
    else if (type === 'course')                                                  crRefetch();
    else if (type === 'exam'    && examMode === 'map' && mapCourseId)            emRefetch();
    else                                                                         eRefetch();
  };

  const handleGetAIAnalysis = async () => {
    setAiLoading(true);
    setAiAnalysis('');
    setAiError('');
    try {
      let analysisType, analysisResults, userProfile;
      if (type === 'college' && mode === 'analyze' && detail) {
        analysisType    = 'college-detail';
        analysisResults = detail;
        userProfile     = { rank: aForm.rank, percentile: aForm.percentile, category: aForm.category };
      } else if (type === 'college') {
        analysisType    = 'colleges';
        analysisResults = sortedColleges;
        userProfile     = { rank: cForm.rank, percentile: cForm.percentile, stream: cForm.stream, state: cForm.state, maxFee: cForm.maxFee, category: cForm.category };
      } else if (type === 'course') {
        analysisType    = 'courses';
        analysisResults = courses.length ? courses : courseColleges;
        userProfile     = { cgpa: crForm.cgpa, percentage: crForm.percentage, level: crForm.level, interests: crForm.interests.join(','), highestQualification: crForm.highestQualification };
      } else {
        analysisType    = 'exams';
        analysisResults = exams;
        userProfile     = { discipline: eForm.discipline, level: eForm.level };
      }
      const res = await predictorService.analyzeResults({ type: analysisType, userProfile, results: analysisResults });
      if (res.data?.code === 'OLLAMA_UNAVAILABLE' || res.status === 503) {
        setAiError('unavailable');
      } else {
        setAiAnalysis(res.data?.data?.analysis || 'No analysis returned.');
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 'OLLAMA_UNAVAILABLE' || err?.response?.status === 503) {
        setAiError('unavailable');
      } else {
        setAiError('failed');
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleTypeChange = (t) => { setType(t); setTriggered(false); setMode('browse'); };

  const isLoading      = cLoading || aLoading || crLoading || eLoading || cfLoading || emLoading;
  const colleges       = cData?.data?.data   || [];
  const detail         = aData?.data?.data   || null;
  const courses        = crData?.data?.data  || [];
  const exams          = eData?.data?.data   || [];
  const courseColleges = cfData?.data?.data  || [];
  const examCollegeMap = emData?.data?.data  || [];


  // shared props for ScoreInputs
  const scoreInputProps = {
    useRankOrPct, setUseRankOrPct,
    cgpa, setCgpa,
    highestQualification, setHQual,
    yearOfPassing, setYearOfPassing,
    instituteName, setInstituteName,
  };
  const sortedColleges = [...colleges].sort((a, b) => {
    if (collegeSort === 'nirf')      return (a.accreditation?.nirfRank || 9999) - (b.accreditation?.nirfRank || 9999);
    if (collegeSort === 'fees')      return (a.fees?.total || 9999999) - (b.fees?.total || 9999999);
    if (collegeSort === 'placement') return (b.placementStats?.placementPercentage || 0) - (a.placementStats?.placementPercentage || 0);
    return b.chance - a.chance;
  });



  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admission Predictor</h1>
        <p>Enter your academic profile and get personalised predictions for colleges, courses, and exams.</p>
      </div>

      {/* Type Tabs */}
      <div className={styles.tabs}>
        {[['college','College Predictor'],['course','Course Predictor'],['exam','Exam Predictor']].map(([k, l]) => (
          <button key={k} className={`${styles.tab} ${type === k ? styles.tabActive : ''}`}
            onClick={() => handleTypeChange(k)}>{l}</button>
        ))}
      </div>

      {/* ── College Tab ──────────────────────────────────────────────────────── */}
      {type === 'college' && (
        <>
          <div className={styles.modeToggle}>
            <button className={`${styles.modeBtn} ${mode === 'browse'  ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode('browse');  setTriggered(false); }}>Browse All Colleges</button>
            <button className={`${styles.modeBtn} ${mode === 'analyze' ? styles.modeBtnActive : ''}`}
              onClick={() => { setMode('analyze'); setTriggered(false); }}>Analyze Specific College</button>
          </div>

          {/* Browse */}
          {mode === 'browse' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Enter your exam score to find matching colleges</p>
              <div className={styles.formGrid}>
                <ScoreInputs form={cForm} setForm={setCForm} {...scoreInputProps} />
                <div className={styles.field}>
                  <label>Category</label>
                  <select value={cForm.category} onChange={e => setCForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Preferred Stream</label>
                  <select value={cForm.stream} onChange={e => setCForm(p => ({ ...p, stream: e.target.value }))}>
                    {STREAMS.map(s => <option key={s} value={s}>{s || 'All Streams'}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Preferred State</label>
                  <select value={cForm.state} onChange={e => setCForm(p => ({ ...p, state: e.target.value }))}>
                    {STATES.map(s => <option key={s} value={s}>{s || 'Any State'}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Max Budget (₹/year)</label>
                  <input type="number" min="0" step="10000" placeholder="e.g. 200000"
                    value={cForm.maxFee} onChange={e => setCForm(p => ({ ...p, maxFee: e.target.value }))} />
                </div>
              </div>
              <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
                {isLoading ? 'Predicting…' : <><FaBolt /> Predict Colleges</>}
              </button>
            </div>
          )}

          {/* Analyze */}
          {mode === 'analyze' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Get year-wise cutoff analysis for a specific college & course</p>
              <p className={styles.formNote}>Enter your score, select a category, and provide the College ID + Course ID.</p>
              <div className={styles.formGrid}>
                <ScoreInputs form={aForm} setForm={setAForm} {...scoreInputProps} />
                <div className={styles.field}>
                  <label>College <span className={styles.req}>*</span></label>
                  <CollegeSearchInput
                    selected={aForm.collegeId ? [{ id: aForm.collegeId, name: aForm.collegeName || aForm.collegeId }] : []}
                    onChange={val => setAForm(p => ({ ...p, collegeId: val[0]?.id || '', collegeName: val[0]?.name || '' }))}
                  />
                </div>
                <div className={styles.field}>
                  <label>Course <span className={styles.req}>*</span></label>
                  <CourseSearchInput
                    selected={aForm.courseId ? [{ id: aForm.courseId, name: aForm.courseName || aForm.courseId }] : []}
                    onChange={val => setAForm(p => ({ ...p, courseId: val[0]?.id || '', courseName: val[0]?.name || '' }))}
                  />
                </div>
                <div className={styles.field}>
                  <label>Category</label>
                  <select value={aForm.category} onChange={e => setAForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

              </div>
              <button className={styles.predictBtn} onClick={handlePredict}
                disabled={isLoading || !aForm.collegeId || !aForm.courseId}>
                {isLoading ? 'Analysing…' : <><FaBolt /> Analyse My Chances</>}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Course Tab ──────────────────────────────────────────────────────── */}
      {type === 'course' && (
        <>
          <div className={styles.modeToggle}>
            <button className={`${styles.modeBtn} ${courseMode === 'recommend' ? styles.modeBtnActive : ''}`}
              onClick={() => { setCourseMode('recommend'); setTriggered(false); }}>Recommend Courses</button>
            <button className={`${styles.modeBtn} ${courseMode === 'specific' ? styles.modeBtnActive : ''}`}
              onClick={() => { setCourseMode('specific'); setTriggered(false); }}>My Chances in a Course</button>
          </div>

          {/* Recommend mode — existing form */}
          {courseMode === 'recommend' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Find courses that match your profile and interests</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Highest Qualification</label>
                  <select value={crForm.highestQualification} onChange={e => setCrForm(p => ({ ...p, highestQualification: e.target.value }))}>
                    <option value="10th">10th</option>
                    <option value="12th">12th / HSC</option>
                    <option value="Diploma">Diploma</option>
                    <option value="UG">Graduation (UG)</option>
                    <option value="PG">Post-Graduation (PG)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Score (% or CGPA out of 10)</label>
                  <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 85 or 8.5"
                    value={crForm.cgpa || crForm.percentage}
                    onChange={e => {
                      const v = e.target.value;
                      Number(v) <= 10
                        ? setCrForm(p => ({ ...p, cgpa: v, percentage: '' }))
                        : setCrForm(p => ({ ...p, percentage: v, cgpa: '' }));
                    }} />
                  <small style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Values ≤ 10 treated as CGPA</small>
                </div>
                <div className={styles.field}>
                  <label>Course Level</label>
                  <select value={crForm.level} onChange={e => setCrForm(p => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map(l => <option key={l} value={l}>{l || 'All Levels'}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Discipline / Stream</label>
                  <input type="text" placeholder="e.g. Engineering, Medical, Management"
                    value={crForm.discipline} onChange={e => setCrForm(p => ({ ...p, discipline: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Your Interests</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {['Coding','Design','Finance','Management','Law','Medicine','Arts','Science','Engineering','Education','Media','Sports'].map(interest => {
                    const val = interest.toLowerCase();
                    const checked = crForm.interests.includes(val);
                    return (
                      <label key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', padding: '0.3rem 0.75rem', borderRadius: '20px', border: `1.5px solid ${checked ? 'var(--gold,#C9A84C)' : 'var(--border,#E8E3DB)'}`, background: checked ? 'var(--gold,#C9A84C)' : 'transparent', color: checked ? '#fff' : 'var(--charcoal)', cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={checked} style={{ display: 'none' }}
                          onChange={e => setCrForm(p => ({ ...p, interests: e.target.checked ? [...p.interests, val] : p.interests.filter(i => i !== val) }))} />
                        {interest}
                      </label>
                    );
                  })}
                </div>
              </div>
              <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
                {isLoading ? 'Predicting…' : <><FaBolt /> Recommend Courses</>}
              </button>
            </div>
          )}

          {/* Specific course chances mode */}
          {courseMode === 'specific' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>See which colleges you can get into for a specific course</p>
              <p className={styles.formNote}>Pick a course and enter your score — we'll rank all colleges offering it by your admission chances.</p>
              <div className={styles.formGrid}>
                <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                  <label>Target Course <span className={styles.req}>*</span></label>
                  <CourseSearchInput
                    selected={cfForm.courseId ? [{ id: cfForm.courseId, name: cfForm.courseName }] : []}
                    onChange={val => setCfForm(p => ({ ...p, courseId: val[0]?.id || '', courseName: val[0]?.name || '' }))}
                  />
                </div>
                <div className={styles.field}>
                  <label>Score Type</label>
                  <select value={useRankOrPct} onChange={e => setUseRankOrPct(e.target.value)}>
                    <option value="percentile">Percentile</option>
                    <option value="rank">Exam Rank</option>
                    <option value="cgpa">CGPA (10-pt scale)</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>{useRankOrPct === 'cgpa' ? 'Your CGPA' : useRankOrPct === 'rank' ? 'Your Rank' : useRankOrPct === 'percentile' ? 'Your Percentile' : 'Your Percentage'}</label>
                  <input type="number"
                    placeholder={useRankOrPct === 'cgpa' ? 'e.g. 8.5' : useRankOrPct === 'rank' ? 'e.g. 15000' : 'e.g. 92.5'}
                    value={useRankOrPct === 'cgpa' ? cfForm.cgpa : useRankOrPct === 'rank' ? cfForm.rank : cfForm.percentile}
                    onChange={e => {
                      if      (useRankOrPct === 'cgpa')       setCfForm(p => ({ ...p, cgpa: e.target.value }));
                      else if (useRankOrPct === 'rank')       setCfForm(p => ({ ...p, rank: e.target.value }));
                      else                                    setCfForm(p => ({ ...p, percentile: e.target.value }));
                    }} />
                </div>
                <div className={styles.field}>
                  <label>Category</label>
                  <select value={cfForm.category} onChange={e => setCfForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading || !cfForm.courseId}>
                {isLoading ? 'Predicting…' : <><FaBolt /> Show My Chances</>}
              </button>
            </div>
          )}
        </>
      )}


      {/* ── Exam Tab ────────────────────────────────────────────────────────── */}
      {type === 'exam' && (
        <>
          <div className={styles.modeToggle}>
            <button className={`${styles.modeBtn} ${examMode === 'recommend' ? styles.modeBtnActive : ''}`}
              onClick={() => { setExamMode('recommend'); setTriggered(false); }}>Exam Recommendations</button>
            <button className={`${styles.modeBtn} ${examMode === 'map' ? styles.modeBtnActive : ''}`}
              onClick={() => { setExamMode('map'); setTriggered(false); }}>Exams by Course & College</button>
          </div>

          {/* Recommend mode */}
          {examMode === 'recommend' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Find the right entrance exams for your goals</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Target Discipline</label>
                  <input type="text" placeholder="e.g. Engineering, Medical, MBA"
                    value={eForm.discipline} onChange={e => setEForm(p => ({ ...p, discipline: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Course Level</label>
                  <select value={eForm.level} onChange={e => setEForm(p => ({ ...p, level: e.target.value }))}>
                    <option value="">All Levels</option>
                    <option value="UG">UG (After Class 12)</option>
                    <option value="PG">PG (After Graduation)</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
              </div>
              <div className={styles.field} style={{ marginBottom: '1rem' }}>
                <label>Colleges you are targeting (optional)</label>
                <CollegeSearchInput selected={eForm.targetCollegeIds} onChange={val => setEForm(p => ({ ...p, targetCollegeIds: val }))} />
              </div>
              <div className={styles.field} style={{ marginBottom: '1.25rem' }}>
                <label>Courses you are targeting (optional)</label>
                <CourseSearchInput selected={eForm.targetCourseIds} onChange={val => setEForm(p => ({ ...p, targetCourseIds: val }))} />
              </div>
              <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
                {isLoading ? 'Predicting…' : <><FaBolt /> Predict Exams</>}
              </button>
            </div>
          )}

          {/* Map mode — which exam opens which colleges for a course */}
          {examMode === 'map' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>See which exams are accepted across colleges for a course</p>
              <p className={styles.formNote}>Pick a course → we'll show every compatible exam with the colleges that accept it, including syllabus links.</p>
              <div className={styles.field} style={{ marginBottom: '1.25rem' }}>
                <label>Target Course <span className={styles.req}>*</span></label>
                <CourseSearchInput
                  selected={mapCourseId ? [{ id: mapCourseId, name: mapCourseName }] : []}
                  onChange={val => { setMapCourseId(val[0]?.id || ''); setMapCourseName(val[0]?.name || ''); }}
                />
              </div>
              <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading || !mapCourseId}>
                {isLoading ? 'Loading…' : <><FaBolt /> Show Exam Map</>}
              </button>
            </div>
          )}
        </>
      )}


      {/* ── Results ────────────────────────────────────────────────────────── */}
      {isLoading && <Loader />}

      {triggered && !isLoading && type === 'college' && mode === 'browse' && (
        colleges.length === 0
          ? <p className={styles.empty}>No colleges found. Try adjusting filters.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Predicted Colleges</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Sort by:</span>
                  {[['chance','Best Chance'],['nirf','NIRF Rank'],['fees','Fees ↑'],['placement','Placement %']].map(([val, label]) => (
                    <button key={val}
                      onClick={() => setCollegeSort(val)}
                      style={{ padding: '0.25rem 0.75rem', borderRadius: 20, border: '1.5px solid', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: collegeSort === val ? 'var(--gold,#C9A84C)' : 'transparent', color: collegeSort === val ? '#fff' : 'var(--charcoal)', borderColor: collegeSort === val ? 'var(--gold,#C9A84C)' : 'var(--border,#E8E3DB)' }}>
                      {label}
                    </button>
                  ))}
                  <span className={styles.resultsCount}>{colleges.length} results</span>
                </div>
              </div>
              <div className={styles.resultsGrid}>
                {sortedColleges.map(c => <CollegeCard key={c._id} item={c} />)}
              </div>
            </>
      )}


      {triggered && !isLoading && type === 'college' && mode === 'analyze' && (
        !detail
          ? <p className={styles.empty}>	No data available yet for this combination. Try a different college or course.</p>
          : <DetailedAnalysisCard data={detail} />
      )}

      {triggered && !isLoading && type === 'course' && courseMode === 'recommend' && (
        courses.length === 0
          ? <p className={styles.empty}>No courses match your filters. Try adjusting your discipline or level.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Matching Courses</span>
                <span className={styles.resultsCount}>{courses.length} results</span>
              </div>
              <div className={styles.resultsGrid}>
                {courses.map(c => <CourseCard key={c._id} item={c} />)}
              </div>
            </>
      )}

      {triggered && !isLoading && type === 'exam' && (
        exams.length === 0
          ? <p className={styles.empty}>No exams found. Try selecting a broader discipline or removing filters.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Recommended Exams</span>
                <span className={styles.resultsCount}>{exams.length} results</span>
              </div>
              <div className={styles.resultsGrid}>
                {exams.map(e => <ExamCard key={e._id} item={e} />)}
              </div>
            </>
      )}
      {/* Course → Colleges results */}
      {triggered && !isLoading && type === 'course' && courseMode === 'specific' && (
        courseColleges.length === 0
          ? <p className={styles.empty}>No colleges found for this course. Try a different course.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Colleges offering {cfForm.courseName}</span>
                <span className={styles.resultsCount}>{courseColleges.length} colleges · ranked by your chances</span>
              </div>
              <div className={styles.resultsGrid}>
                {courseColleges.map((item, i) => (
                  <div key={i} className={styles.resultCard}>
                    <ChanceMeter chance={item.chance} color={item.color} bucket={item.bucket} />
                    <p className={styles.cardName}>{item.college?.name}</p>
                    <p className={styles.cardMeta}>
                      {item.college?.contact?.city}{item.college?.contact?.state ? `, ${item.college.contact.state}` : ''} · {item.college?.collegeType || 'College'}
                    </p>
                    <div className={styles.cardDetails}>
                      {item.college?.accreditation?.nirfRank    && <span className={styles.detail}>NIRF #{item.college.accreditation.nirfRank}</span>}
                      {item.college?.accreditation?.naacGrade   && <span className={styles.detail}>NAAC {item.college.accreditation.naacGrade}</span>}
                      {item.fees && <span className={styles.detail}>{fmt(item.fees)}/yr</span>}
                      {item.seatIntake && <span className={styles.detail}>{item.seatIntake} seats</span>}
                      {item.lastYearClosingRank && <span className={`${styles.detail} ${styles.cutoffDetail}`}>Closing rank: {fmtNum(item.lastYearClosingRank)}</span>}
                    </div>
                    {item.examsRequired?.length > 0 && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                        Exam: {item.examsRequired.map(e => e.name).join(', ')}
                      </p>
                    )}
                    <span className={item.hasRealData ? styles.realDataBadge : styles.estimateBadge}>
                      {item.hasRealData ? <><FaCheckCircle /> Cutoff data</> : '~ NIRF estimate'}
                    </span>
                    <Link to={`/colleges/${item.college?.slug}`} className={styles.cardLink}>View College →</Link>
                  </div>
                ))}
              </div>
            </>
      )}

      {/* Exam-College Map results */}
      {triggered && !isLoading && type === 'exam' && examMode === 'map' && (
        examCollegeMap.length === 0
          ? <p className={styles.empty}>No exam data found. Try adjusting your filters or selecting a different course.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Exam Map for {mapCourseName}</span>
                <span className={styles.resultsCount}>{examCollegeMap.length} exams found</span>
              </div>
              {examCollegeMap.map((entry, i) => (
                <div key={i} className={styles.detailCard} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--charcoal)', margin: 0 }}>{entry.exam.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.2rem 0 0' }}>
                        {entry.exam.examLevel} · {entry.exam.conductingBody || ''} · {entry.exam.category || ''} · {entry.exam.examMode || ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {entry.exam.officialWebsite && (
                        <a href={entry.exam.officialWebsite} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 6, background: 'var(--gold,#C9A84C)', color: '#fff', fontWeight: 700, textDecoration: 'none' }}>
                          Official Site
                        </a>
                      )}
                      {entry.exam.registrationLink && (
                        <a href={entry.exam.registrationLink} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 6, border: '1.5px solid var(--gold,#C9A84C)', color: 'var(--gold,#C9A84C)', fontWeight: 700, textDecoration: 'none' }}>
                          Register
                        </a>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    {entry.colleges.length} College{entry.colleges.length !== 1 ? 's' : ''} accept this exam
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {entry.colleges.map((c, j) => (
                      <Link key={j} to={`/colleges/${c.slug}`}
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: 20, background: 'var(--bg-soft,#F7F4EF)', color: 'var(--charcoal)', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border,#E8E3DB)' }}>
                        {c.name}
                        {c.accreditation?.nirfRank ? ` (NIRF #${c.accreditation.nirfRank})` : ''}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
      )}
      {/* ── AI Counsellor Panel ──────────────────────────────────────────── */}
      {triggered && !isLoading && (colleges.length > 0 || detail || courses.length > 0 || exams.length > 0 || courseColleges.length > 0) && (
        <div className={styles.aiPanel}>
          <div className={styles.aiPanelHeader}>
            <div className={styles.aiPanelInfo}>
              <span className={styles.aiPanelIcon}><FaRobot /></span>
              <div>
                <p className={styles.aiPanelTitle}>AI Counsellor</p>
                <p className={styles.aiPanelSub}>AI-powered · personalized advice based on your results</p>
              </div>
            </div>
            <button
              className={styles.aiBtn}
              onClick={handleGetAIAnalysis}
              disabled={aiLoading}
            >
              {aiLoading
                ? <><FaSpinner className={styles.spinIcon} /> Analysing…</>
                : <><FaRobot /> Get AI Advice</>
              }
            </button>
          </div>

          {/* Analysis result */}
          {aiAnalysis && (
            <p className={styles.aiResult}>{aiAnalysis}</p>
          )}

          {/* Ollama not running */}
          {aiError === 'unavailable' && (
            <div className={styles.aiUnavailable}>
              <FaExclamationTriangle className={styles.aiUnavailableIcon} />
              <div>
                <p className={styles.aiUnavailableTitle}>AI service unavailable</p>
                <p className={styles.aiUnavailableSub}>
                  Set a <code>GROQ_API_KEY</code> in your backend <code>.env</code> for cloud AI,
                  or run Ollama locally with <code>ollama serve</code>.
                </p>
              </div>
            </div>
          )}

          {/* Generic error */}
          {aiError === 'failed' && (
            <div className={styles.aiUnavailable}>
              <FaExclamationTriangle className={styles.aiUnavailableIcon} />
              <div>
                <p className={styles.aiUnavailableTitle}>Analysis failed</p>
                <p className={styles.aiUnavailableSub}>Something went wrong. Please try again.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <p className={styles.note}>
        * Predictions use actual cutoff data (rank/score) where available, falling back to NIRF ranking estimates.<br />
        Actual admission depends on seat availability, reservation policies, and exam authority cutoffs.
      </p>
    </div>
  );
};

export default Predictor;
