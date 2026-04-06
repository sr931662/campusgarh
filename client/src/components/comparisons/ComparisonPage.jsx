import React, { useState } from 'react';
import { FaUniversity, FaGraduationCap, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../store/authStore';
import { useCreateComparison } from '../../hooks/queries';
import ComparisonSelector from './ComparisonSelector';
import ComparisonTable from './ComparisonTable';
import Button from '../common/Button/Button';
import styles from './ComparisonPage.module.css';

const TYPES = [
  {
    key: 'college',
    label: 'Colleges',
    icon: <FaUniversity />,
    desc: 'Compare fees, placements, rankings & more',
    seoDesc: 'Compare top colleges in India side by side — fees, NIRF rankings, placement records, facilities, and eligibility criteria — to make the right admission decision.',
  },
  {
    key: 'course',
    label: 'Courses',
    icon: <FaGraduationCap />,
    desc: 'Compare duration, eligibility & fee ranges',
    seoDesc: 'Compare courses across Indian colleges — duration, eligibility, fee ranges, career prospects, and exam requirements — all in one place.',
  },
  {
    key: 'exam',
    label: 'Exams',
    icon: <FaFileAlt />,
    desc: 'Compare exam modes, frequency & fees',
    seoDesc: 'Compare entrance exams like JEE, NEET, CAT, CLAT, and more — exam mode, frequency, application fees, eligibility, and accepted colleges — to plan your preparation.',
  },
];

const COMPARE_FAQS = {
  college: [
    { q: 'How many colleges can I compare at once?', a: 'You can compare up to 4 colleges side by side on CampusGarh — covering fees, NIRF rankings, placements, facilities, and more.' },
    { q: 'What parameters are compared for colleges?', a: 'CampusGarh compares colleges on NIRF ranking, location, fees, average placement package, accreditation, facilities, and available courses.' },
    { q: 'Can I save my college comparison?', a: 'Yes! Logged-in users can save any comparison for future reference from their profile dashboard.' },
    { q: 'Is the college data verified?', a: 'Yes. All data is sourced from official NIRF reports, NAAC/NBA records, and verified institutional data.' },
  ],
  course: [
    { q: 'What can I compare between courses?', a: 'You can compare courses on duration, eligibility criteria, fee ranges, career prospects, and the entrance exams required for admission.' },
    { q: 'Can I compare courses across different colleges?', a: 'The course comparison tool compares course parameters. To see which colleges offer a specific course, use the College Predictor with your preferred discipline.' },
    { q: 'How do I find the best course for me?', a: 'Use the AI Predictor\'s Course Recommender — enter your qualification, score, and interests to get personalized course recommendations.' },
  ],
  exam: [
    { q: 'Which exams can I compare on CampusGarh?', a: 'You can compare national-level exams like JEE Main, NEET, CAT, CLAT, GATE, CUET, and many more across all major disciplines.' },
    { q: 'What exam parameters are shown in the comparison?', a: 'Exam comparisons cover conducting body, exam mode (online/offline), frequency per year, application fee, eligibility criteria, and accepted colleges/courses.' },
    { q: 'Can I track exam dates and registration deadlines?', a: 'Yes. Visit the individual exam detail pages on CampusGarh for current dates, registration schedules, and preparation resources.' },
  ],
};


const FAQSection = ({ faqs }) => {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', padding: '1rem 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.97rem', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            {faq.q}
            <span>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <p style={{ padding: '0 0 1rem', color: '#4b5563', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};


const ComparisonPage = () => {
  const { isAuthenticated } = useAuth();
  const [type, setType] = useState('college');
  const [selectedItems, setSelectedItems] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const createComparisonMutation = useCreateComparison();

  const activeType = TYPES.find(t => t.key === type);

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelectedItems([]);
    setSaveStatus('');
  };

  const addItem = (item) => {
    if (selectedItems.length >= 4) return;
    if (!selectedItems.find(i => i._id === item._id)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id) => setSelectedItems(prev => prev.filter(i => i._id !== id));

  const saveComparison = async () => {
    if (selectedItems.length < 2) return;
    const ids = selectedItems.map(i => i._id);
    const payload = { type };
    if (type === 'college') payload.collegeIds = ids;
    else if (type === 'course') payload.courseIds = ids;
    else payload.examIds = ids;

    try {
      await createComparisonMutation.mutateAsync(payload);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Hero Header ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Side-by-side comparison</p>
          <h1 className={styles.heroTitle}>Compare &amp; Decide</h1>
          <p className={styles.heroDesc}>
            Add up to 4 {activeType?.label.toLowerCase()} and compare them across all key parameters to make the right choice.
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── Type Tabs ── */}
        <div className={styles.typeGroup}>
          {TYPES.map(t => (
            <button
              key={t.key}
              className={`${styles.typeTab} ${type === t.key ? styles.typeTabActive : ''}`}
              onClick={() => handleTypeChange(t.key)}
            >
              <span className={styles.typeIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
          {/* SEO Description */}
          <div style={{
            textAlign: 'center',
            margin: '0 auto 2rem',
            maxWidth: '680px',
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06), rgba(201,168,76,0.02))',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '12px',
          }}>
            <p style={{ color: '#6b7280', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}>
              {activeType?.seoDesc}
            </p>
          </div>


        </div>

        {/* ── Selector ── */}
        <div className={styles.selectorWrap}>
          <div className={styles.selectorLabel}>
            <span className={styles.selectorCount}>
              {selectedItems.length} / 4 selected
            </span>
            {selectedItems.length < 2 && (
              <span className={styles.selectorHint}>Add at least 2 {activeType?.label.toLowerCase()} to compare</span>
            )}
          </div>
          <ComparisonSelector
            key={type}
            type={type}
            selectedItems={selectedItems}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </div>

        {/* ── Comparison Table ── */}
        {selectedItems.length >= 2 ? (
          <>
            <ComparisonTable type={type} items={selectedItems} />

            {isAuthenticated && (
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={saveComparison}
                  loading={createComparisonMutation.isPending}
                >
                  Save Comparison
                </Button>
                {saveStatus === 'saved' && (
                  <span className={styles.saveSuccess}>Comparison saved successfully!</span>
                )}
                {saveStatus === 'error' && (
                  <span className={styles.saveError}>Failed to save. Please try again.</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{activeType?.icon}</div>
            <h3 className={styles.emptyTitle}>No comparison yet</h3>
            <p className={styles.emptyDesc}>{activeType?.desc}</p>
            <div className={styles.emptySteps}>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>1</span>
                <span>Search for a {activeType?.label.slice(0, -1).toLowerCase()}</span>
              </div>
              <div className={styles.emptyStepArrow}>→</div>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>2</span>
                <span>Add at least 2 items</span>
              </div>
              <div className={styles.emptyStepArrow}>→</div>
              <div className={styles.emptyStep}>
                <span className={styles.stepNum}>3</span>
                <span>Compare side by side</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <FAQSection faqs={COMPARE_FAQS[type]} />
    </div>
  );
};

export default ComparisonPage;
