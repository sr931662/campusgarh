import styles from './CollegeAdmission.module.css';
import { formatCurrency } from '../../utils/formatters';

export default function CollegeAdmission({ college }) {
  if (!college) return null;
  const ap = college.admissionProcess || {};
  const hasContent = ap.mode || ap.entranceExamName || ap.applicationFee || ap.applicationLink
    || ap.steps?.length || ap.documentsRequired?.length || ap.applicationStartDate;

  if (!hasContent) {
    return (
      <div className={styles.wrapper}>
        <h2 className={styles.sectionTitle}>Admission Process</h2>
        <p className={styles.emptyMsg}>No admission information available yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Admission Process</h2>

      {/* Approval badges */}
      {college.approvedBy?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.approvalRow}>
            {college.approvedBy.map(body => (
              <span key={body} className={styles.approvalBadge}
                style={{ background: '#1A6B4A' }}>
                {body}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key info cards */}
      <div className={styles.infoCards}>
        {ap.mode && (
          <div className={styles.infoCard}>
            <p className={styles.infoLabel}>Admission Mode</p>
            <p className={styles.infoValue}>{ap.mode}</p>
          </div>
        )}
        {ap.entranceExamName && (
          <div className={styles.infoCard}>
            <p className={styles.infoLabel}>Entrance Exam</p>
            <p className={styles.infoValue}>{ap.entranceExamName}</p>
          </div>
        )}
        {ap.applicationFee > 0 && (
          <div className={styles.infoCard}>
            <p className={styles.infoLabel}>Application Fee</p>
            <p className={styles.infoValue}>{formatCurrency(ap.applicationFee)}</p>
          </div>
        )}
        {ap.applicationStartDate && (
          <div className={styles.infoCard}>
            <p className={styles.infoLabel}>Applications Open</p>
            <p className={styles.infoValue}>
              {new Date(ap.applicationStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
        {ap.applicationEndDate && (
          <div className={styles.infoCard}>
            <p className={styles.infoLabel}>Last Date</p>
            <p className={styles.infoValue}>
              {new Date(ap.applicationEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Apply button */}
      {ap.applicationLink && (
        <div className={styles.section}>
          <a href={ap.applicationLink} target="_blank" rel="noopener noreferrer"
            className={styles.applyBtn}>
            Apply Now ↗
          </a>
        </div>
      )}

      {/* Steps */}
      {ap.steps?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>How to Apply</h3>
          <ol className={styles.stepsList}>
            {ap.steps.map((step, i) => (
              <li key={i} className={styles.step}>
                <div className={styles.stepNumber}>{step.stepNumber || i + 1}</div>
                <div className={styles.stepContent}>
                  {step.title && <p className={styles.stepTitle}>{step.title}</p>}
                  {step.description && <p className={styles.stepDesc}>{step.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Documents */}
      {ap.documentsRequired?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Documents Required</h3>
          <div className={styles.docList}>
            {ap.documentsRequired.map(doc => (
              <span key={doc} className={styles.docTag}>{doc}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}