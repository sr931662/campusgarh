import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
      {item.hasRealData ? '✓ Actual cutoff data' : '~ NIRF estimate'}
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
                <span>{fmt(p.averagePackage)  || '—'}</span>
                <span>{fmt(p.highestPackage)  || '—'}</span>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const Predictor = () => {
  const [cgpa, setCgpa]                           = useState('');
  const [useRankOrPct, setUseRankOrPct]           = useState('percentile'); // 'percentile'|'rank'|'cgpa'
  const [yearOfPassing, setYearOfPassing]         = useState('');
  const [instituteName, setInstituteName]         = useState('');
  const [examRank, setExamRank]                   = useState('');
  const [highestQualification, setHQual]          = useState('12th');

  const [type, setType]       = useState('college');
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

  const handlePredict = () => {
    setTriggered(true);
    if      (type === 'college' && mode === 'analyze') aRefetch();
    else if (type === 'college')                       cRefetch();
    else if (type === 'course')                        crRefetch();
    else                                               eRefetch();
  };

  const handleTypeChange = (t) => { setType(t); setTriggered(false); setMode('browse'); };

  const isLoading = cLoading || aLoading || crLoading || eLoading;
  const colleges  = cData?.data?.data  || [];
  const detail    = aData?.data?.data  || null;
  const courses   = crData?.data?.data || [];
  const exams     = eData?.data?.data  || [];

  // ── Shared score input block ─────────────────────────────────────────────────
  const ScoreInputs = ({ form, setForm }) => (
    <>
      {/* Score type toggle */}
      <div className={styles.field}>
        <label>Score Type</label>
        <select value={useRankOrPct} onChange={e => setUseRankOrPct(e.target.value)}>
          <option value="percentile">Percentile</option>
          <option value="rank">Exam Rank</option>
          <option value="cgpa">CGPA (10-pt scale)</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {/* Score value input */}
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

      {/* Highest Qualification */}
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

      {/* Year of Passing */}
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

      {/* Institute / School Name */}
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
                <ScoreInputs form={cForm} setForm={setCForm} />
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
                {isLoading ? 'Predicting…' : '⚡ Predict Colleges'}
              </button>
            </div>
          )}

          {/* Analyze */}
          {mode === 'analyze' && (
            <div className={styles.formCard}>
              <p className={styles.formTitle}>Get year-wise cutoff analysis for a specific college & course</p>
              <p className={styles.formNote}>Enter your score, select a category, and provide the College ID + Course ID.</p>
              <div className={styles.formGrid}>
                <ScoreInputs form={aForm} setForm={setAForm} />
                <div className={styles.field}>
                  <label>College ID <span className={styles.req}>*</span></label>
                  <input type="text" placeholder="MongoDB ObjectId of the college"
                    value={aForm.collegeId} onChange={e => setAForm(p => ({ ...p, collegeId: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Course ID <span className={styles.req}>*</span></label>
                  <input type="text" placeholder="MongoDB ObjectId of the course"
                    value={aForm.courseId} onChange={e => setAForm(p => ({ ...p, courseId: e.target.value }))} />
                </div>
              </div>
              <button className={styles.predictBtn} onClick={handlePredict}
                disabled={isLoading || !aForm.collegeId || !aForm.courseId}>
                {isLoading ? 'Analysing…' : '⚡ Analyse My Chances'}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Course Tab ──────────────────────────────────────────────────────── */}
      {type === 'course' && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>Enter your academic profile to find matching courses</p>
          <div className={styles.formGrid}>
            {/* Qualification */}
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
            {/* Score */}
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
              <small style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Values ≤ 10 treated as CGPA, above as %</small>
            </div>
            {/* Level */}
            <div className={styles.field}>
              <label>Course Level</label>
              <select value={crForm.level} onChange={e => setCrForm(p => ({ ...p, level: e.target.value }))}>
                {LEVELS.map(l => <option key={l} value={l}>{l || 'All Levels'}</option>)}
              </select>
            </div>
            {/* Discipline */}
            <div className={styles.field}>
              <label>Discipline / Stream</label>
              <input type="text" placeholder="e.g. Engineering, Medical, Management"
                value={crForm.discipline} onChange={e => setCrForm(p => ({ ...p, discipline: e.target.value }))} />
            </div>
          </div>
          {/* Interests */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Your Interests (select all that apply)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['Coding','Design','Finance','Management','Law','Medicine','Arts','Science','Engineering','Education','Media','Sports'].map(interest => {
                const val = interest.toLowerCase();
                const checked = crForm.interests.includes(val);
                return (
                  <label key={val} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', padding: '0.3rem 0.75rem', borderRadius: '20px', border: `1.5px solid ${checked ? 'var(--gold, #C9A84C)' : 'var(--border, #E8E3DB)'}`, background: checked ? 'var(--gold, #C9A84C)' : 'transparent', color: checked ? '#fff' : 'var(--charcoal)', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={checked} style={{ display: 'none' }}
                      onChange={e => setCrForm(p => ({
                        ...p,
                        interests: e.target.checked ? [...p.interests, val] : p.interests.filter(i => i !== val)
                      }))} />
                    {interest}
                  </label>
                );
              })}
            </div>
          </div>
          <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Predicting…' : '⚡ Predict Courses'}
          </button>
        </div>
      )}

      {/* ── Exam Tab ────────────────────────────────────────────────────────── */}
      {type === 'exam' && (
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
          {/* Target Colleges */}
          <div className={styles.field} style={{ marginBottom: '1rem' }}>
            <label>Colleges you are targeting (optional)</label>
            <CollegeSearchInput
              selected={eForm.targetCollegeIds}
              onChange={val => setEForm(p => ({ ...p, targetCollegeIds: val }))}
            />
          </div>
          {/* Target Courses */}
          <div className={styles.field} style={{ marginBottom: '1.25rem' }}>
            <label>Courses you are targeting (optional)</label>
            <CourseSearchInput
              selected={eForm.targetCourseIds}
              onChange={val => setEForm(p => ({ ...p, targetCourseIds: val }))}
            />
          </div>
          <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Predicting…' : '⚡ Predict Exams'}
          </button>
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {isLoading && <Loader />}

      {triggered && !isLoading && type === 'college' && mode === 'browse' && (
        colleges.length === 0
          ? <p className={styles.empty}>No colleges found. Try adjusting filters.</p>
          : <>
              <div className={styles.resultsHeader}>
                <span className={styles.resultsTitle}>Predicted Colleges</span>
                <span className={styles.resultsCount}>{colleges.length} results</span>
              </div>
              <div className={styles.resultsGrid}>
                {colleges.map(c => <CollegeCard key={c._id} item={c} />)}
              </div>
            </>
      )}

      {triggered && !isLoading && type === 'college' && mode === 'analyze' && (
        !detail
          ? <p className={styles.empty}>No data found for this college-course combination.</p>
          : <DetailedAnalysisCard data={detail} />
      )}

      {triggered && !isLoading && type === 'course' && (
        courses.length === 0
          ? <p className={styles.empty}>No courses found. Try a different discipline or level.</p>
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
          ? <p className={styles.empty}>No exams found. Try a broader discipline.</p>
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

      <p className={styles.note}>
        * Predictions use actual cutoff data (rank/score) where available, falling back to NIRF ranking estimates.<br />
        Actual admission depends on seat availability, reservation policies, and exam authority cutoffs.
      </p>
    </div>
  );
};

export default Predictor;
