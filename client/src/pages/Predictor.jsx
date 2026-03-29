import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { predictorService } from '../services/predictorService';
import Loader from '../components/common/Loader/Loader';
import styles from './Predictor.module.css';

const STREAMS = [
  '', 'Engineering & Technology', 'Medical & Health Sciences', 'Management & Business',
  'Law', 'Arts & Science', 'Architecture & Planning', 'Pharmacy', 'Agriculture',
  'Education & Teaching', 'Design & Fine Arts', 'Commerce & Finance', 'Technical', 'Multi-Disciplinary',
];

const LEVELS = ['', 'UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'];

const STATES = [
  '', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Madhya Pradesh', 'Andhra Pradesh',
  'Punjab', 'Haryana', 'Kerala', 'Bihar', 'Odisha', 'Assam',
];

const getBarColor = (color) => ({
  green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444',
}[color] || '#9ca3af');

const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : null;

/* ── College Result Card ── */
const CollegeCard = ({ item }) => (
  <div className={styles.resultCard}>
    <span className={`${styles.chanceBadge} ${styles[item.color]}`}>{item.bucket}</span>
    <div className={styles.chanceBar}>
      <div className={styles.chanceBarFill} style={{ width: `${item.chance}%`, background: getBarColor(item.color) }} />
    </div>
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>
      {item.contact?.city}{item.contact?.state ? `, ${item.contact.state}` : ''} · {item.collegeType || 'College'}
    </p>
    <div className={styles.cardDetails}>
      {item.accreditation?.nirfRank && <span className={styles.detail}>NIRF #{item.accreditation.nirfRank}</span>}
      {item.accreditation?.naacGrade && <span className={styles.detail}>NAAC {item.accreditation.naacGrade}</span>}
      {fmt(item.fees?.total) && <span className={styles.detail}>{fmt(item.fees.total)}/yr</span>}
      {item.placementStats?.placementPercentage && <span className={styles.detail}>{item.placementStats.placementPercentage}% Placed</span>}
    </div>
    <Link to={`/colleges/${item.slug}`} className={styles.cardLink}>View College →</Link>
  </div>
);

/* ── Course Result Card ── */
const CourseCard = ({ item }) => (
  <div className={styles.resultCard}>
    <span className={`${styles.chanceBadge} ${styles[item.color]}`}>{item.bucket}</span>
    <div className={styles.chanceBar}>
      <div className={styles.chanceBarFill} style={{ width: `${item.chance}%`, background: getBarColor(item.color) }} />
    </div>
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>{item.category} · {item.discipline || 'General'}</p>
    <div className={styles.cardDetails}>
      {item.duration && <span className={styles.detail}>{item.duration}</span>}
      {item.mode && <span className={styles.detail}>{item.mode}</span>}
      {item.feeRange?.min && <span className={styles.detail}>{fmt(item.feeRange.min)} – {fmt(item.feeRange.max)}</span>}
    </div>
    <Link to={`/courses/${item.slug}`} className={styles.cardLink}>View Course →</Link>
  </div>
);

/* ── Exam Result Card ── */
const ExamCard = ({ item }) => (
  <div className={styles.resultCard}>
    <span className={`${styles.chanceBadge} ${styles[item.color]}`}>{item.bucket}</span>
    <div className={styles.chanceBar}>
      <div className={styles.chanceBarFill} style={{ width: `${item.chance}%`, background: getBarColor(item.color) }} />
    </div>
    <p className={styles.cardName}>{item.name}</p>
    <p className={styles.cardMeta}>{item.category} · {item.examLevel || 'Entrance Exam'}</p>
    <div className={styles.cardDetails}>
      {item.conductingBody && <span className={styles.detail}>{item.conductingBody}</span>}
      {item.examMode && <span className={styles.detail}>{item.examMode}</span>}
      {item.frequency && <span className={styles.detail}>{item.frequency}</span>}
      {item.registrationFee && <span className={styles.detail}>Fee ₹{item.registrationFee}</span>}
    </div>
    <Link to={`/exams/${item.slug}`} className={styles.cardLink}>View Exam →</Link>
  </div>
);

/* ── Main Predictor Page ── */
const Predictor = () => {
  const [type, setType] = useState('college');

  // College form state
  const [cForm, setCForm] = useState({ percentile: '', rank: '', stream: '', state: '', maxFee: '', inputMode: 'percentile' });
  // Course form state
  const [crForm, setCrForm] = useState({ percentage: '', level: '', discipline: '' });
  // Exam form state
  const [eForm, setEForm] = useState({ discipline: '', level: '' });

  const [triggered, setTriggered] = useState(false);

  const { data: cData, isLoading: cLoading, refetch: cRefetch } = useQuery({
    queryKey: ['predict-colleges', cForm],
    queryFn: () => predictorService.predictColleges({
      percentile: cForm.inputMode === 'percentile' ? cForm.percentile : undefined,
      rank:       cForm.inputMode === 'rank'       ? cForm.rank       : undefined,
      stream: cForm.stream || undefined,
      state:  cForm.state  || undefined,
      maxFee: cForm.maxFee || undefined,
    }),
    enabled: false,
  });

  const { data: crData, isLoading: crLoading, refetch: crRefetch } = useQuery({
    queryKey: ['predict-courses', crForm],
    queryFn: () => predictorService.predictCourses({
      percentage:  crForm.percentage  || undefined,
      level:       crForm.level       || undefined,
      discipline:  crForm.discipline  || undefined,
    }),
    enabled: false,
  });

  const { data: eData, isLoading: eLoading, refetch: eRefetch } = useQuery({
    queryKey: ['predict-exams', eForm],
    queryFn: () => predictorService.predictExams({
      discipline: eForm.discipline || undefined,
      level:      eForm.level      || undefined,
    }),
    enabled: false,
  });

  const handlePredict = () => {
    setTriggered(true);
    if (type === 'college') cRefetch();
    else if (type === 'course') crRefetch();
    else eRefetch();
  };

  const handleTypeChange = (t) => { setType(t); setTriggered(false); };

  const colleges = cData?.data?.data  || [];
  const courses  = crData?.data?.data || [];
  const exams    = eData?.data?.data  || [];
  const isLoading = cLoading || crLoading || eLoading;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Admission Predictor</h1>
        <p>Enter your academic profile and get personalised predictions for colleges, courses, and exams.</p>
      </div>

      {/* Type Tabs */}
      <div className={styles.tabs}>
        {[['college','College Predictor'],['course','Course Predictor'],['exam','Exam Predictor']].map(([k, l]) => (
          <button key={k} className={`${styles.tab} ${type === k ? styles.tabActive : ''}`} onClick={() => handleTypeChange(k)}>{l}</button>
        ))}
      </div>

      {/* ── College Form ── */}
      {type === 'college' && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>Enter your exam score to predict college admissions</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Input Type</label>
              <select value={cForm.inputMode} onChange={e => setCForm(p => ({ ...p, inputMode: e.target.value }))}>
                <option value="percentile">Percentile</option>
                <option value="rank">Rank</option>
              </select>
            </div>
            {cForm.inputMode === 'percentile' ? (
              <div className={styles.field}>
                <label>Your Percentile</label>
                <input type="number" min="0" max="100" step="0.01" placeholder="e.g. 97.5"
                  value={cForm.percentile} onChange={e => setCForm(p => ({ ...p, percentile: e.target.value }))} />
              </div>
            ) : (
              <div className={styles.field}>
                <label>Your Rank</label>
                <input type="number" min="1" placeholder="e.g. 5000"
                  value={cForm.rank} onChange={e => setCForm(p => ({ ...p, rank: e.target.value }))} />
              </div>
            )}
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

      {/* ── Course Form ── */}
      {type === 'course' && (
        <div className={styles.formCard}>
          <p className={styles.formTitle}>Enter your academic profile to find matching courses</p>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Class 12 / Graduation %</label>
              <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 85"
                value={crForm.percentage} onChange={e => setCrForm(p => ({ ...p, percentage: e.target.value }))} />
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
          <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Predicting…' : '⚡ Predict Courses'}
          </button>
        </div>
      )}

      {/* ── Exam Form ── */}
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
          <button className={styles.predictBtn} onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Predicting…' : '⚡ Predict Exams'}
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {isLoading && <Loader />}

      {triggered && !isLoading && type === 'college' && (
        colleges.length === 0
          ? <p className={styles.empty}>No colleges found matching your profile. Try adjusting your filters.</p>
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
        * Predictions are based on NIRF rankings, fee data, and eligibility criteria in our database.<br />
        Actual admission depends on exam authority cutoffs, seat availability, and reservation policies.
      </p>
    </div>
  );
};

export default Predictor;
