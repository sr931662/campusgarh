import React from 'react';
import styles from './ExamRegistration.module.css';
import { formatDate } from '../../utils/formatters';

const ExamRegistration = ({ exam }) => {
  const { conductingBody, examMode, examLanguages, frequency, registrationSteps,
    documentsRequired, registrationFeeDetails, registrationFee, admitCardInfo, counsellingInfo } = exam;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>Registration & Application</h2>

      {/* Key Info */}
      <div className={styles.infoCards}>
        {conductingBody && (
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Conducting Body</div>
            <div className={styles.infoValue}>{conductingBody}</div>
          </div>
        )}
        {examMode && (
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Exam Mode</div>
            <div className={styles.infoValue}>{examMode}</div>
          </div>
        )}
        {frequency && (
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Frequency</div>
            <div className={styles.infoValue}>{frequency}</div>
          </div>
        )}
      </div>

      {examLanguages?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Available Languages</h3>
          <div className={styles.tagRow}>
            {examLanguages.map((lang, idx) => (
              <span key={idx} className={styles.langTag}>{lang}</span>
            ))}
          </div>
        </div>
      )}

      {/* Registration Fee Table */}
      {registrationFeeDetails && Object.values(registrationFeeDetails).some(Boolean) ? (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Registration Fee</h3>
          <div className={styles.feeTable}>
            {registrationFeeDetails.general && <div className={styles.feeRow}><span>General / EWS</span><span>₹{registrationFeeDetails.general}</span></div>}
            {registrationFeeDetails.obc && <div className={styles.feeRow}><span>OBC-NCL</span><span>₹{registrationFeeDetails.obc}</span></div>}
            {registrationFeeDetails.sc_st && <div className={styles.feeRow}><span>SC / ST</span><span>₹{registrationFeeDetails.sc_st}</span></div>}
            {registrationFeeDetails.female && <div className={styles.feeRow}><span>Female (All Categories)</span><span>₹{registrationFeeDetails.female}</span></div>}
            {registrationFeeDetails.pwd && <div className={styles.feeRow}><span>PwD</span><span>₹{registrationFeeDetails.pwd}</span></div>}
          </div>
        </div>
      ) : registrationFee ? (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Registration Fee</h3>
          <p className={styles.feeSingle}>₹{registrationFee}</p>
        </div>
      ) : null}

      {/* How to Apply Steps */}
      {registrationSteps?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>How to Apply</h3>
          <div className={styles.stepsList}>
            {registrationSteps.map((step, idx) => (
              <div key={idx} className={styles.step}>
                <div className={styles.stepNum}>{idx + 1}</div>
                <div className={styles.stepText}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documentsRequired?.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Documents Required</h3>
          <div className={styles.tagRow}>
            {documentsRequired.map((doc, idx) => (
              <span key={idx} className={styles.docTag}>📄 {doc}</span>
            ))}
          </div>
        </div>
      )}

      {/* Admit Card */}
      {admitCardInfo && (admitCardInfo.expectedDate || admitCardInfo.downloadLink) && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Admit Card</h3>
          <div className={styles.infoBox}>
            {admitCardInfo.expectedDate && (
              <p><strong>Expected Date:</strong> {formatDate(admitCardInfo.expectedDate, 'dd MMM yyyy')}</p>
            )}
            {admitCardInfo.downloadLink && (
              <a href={admitCardInfo.downloadLink} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                Download Admit Card →
              </a>
            )}
            {admitCardInfo.instructions?.length > 0 && (
              <ul className={styles.instructionList}>
                {admitCardInfo.instructions.map((inst, idx) => (
                  <li key={idx}>{inst}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Counselling */}
      {counsellingInfo?.overview && (
        <div className={styles.section}>
          <h3 className={styles.subTitle}>Counselling Process</h3>
          <div className={styles.infoBox}>
            {counsellingInfo.conductingBody && <p><strong>Conducted by:</strong> {counsellingInfo.conductingBody}</p>}
            {counsellingInfo.mode && <p><strong>Mode:</strong> {counsellingInfo.mode}</p>}
            {counsellingInfo.rounds && <p><strong>Rounds:</strong> {counsellingInfo.rounds}</p>}
            {counsellingInfo.overview && <p className={styles.overviewText}>{counsellingInfo.overview}</p>}
            {counsellingInfo.websiteLink && (
              <a href={counsellingInfo.websiteLink} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                Counselling Portal →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRegistration;
