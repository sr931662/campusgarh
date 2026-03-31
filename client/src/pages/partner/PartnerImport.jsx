import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useImportExcel, useDownloadTemplate } from '../../hooks/queries';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import styles from './PartnerImport.module.css';

const MODEL = 'AdmissionEnquiry';

const COLUMN_GUIDE = {
  required: ['Student Name', 'Phone'],
  optional: [
    'Email', 'Father Name', 'Mother Name',
    'Passed From (10th/12th/Diploma/ITI/Graduation)',
    'Passed Year', 'Address', 'Preferred City', 'Message',
  ],
};

export default function PartnerImport() {
  const [file, setFile]                 = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showErrors, setShowErrors]     = useState(false);
  const fileRef = useRef();

  const { mutate: importExcel, isPending: importing }     = useImportExcel();
  const { mutate: downloadTemplate, isPending: downloading } = useDownloadTemplate();

  const handleImport = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('model', MODEL);
    importExcel(
      { formData: fd, model: MODEL },
      {
        onSuccess: (axiosResponse) => {
          const payload = axiosResponse?.data?.data;
          setImportResult(payload ?? null);
          setShowErrors(false);
          setFile(null);
          if (fileRef.current) fileRef.current.value = '';
        },
        onError: (err) => {
          setImportResult({ _error: err.response?.data?.message || 'Import request failed' });
        },
      }
    );
  };

  const apiError     = importResult?._error;
  const succeeded    = importResult?.succeededRows ?? 0;
  const failed       = importResult?.failedRows    ?? 0;
  const total        = importResult?.totalRows     ?? (succeeded + failed);
  const errors       = importResult?.importErrors  ?? [];
  const hasResult    = !!importResult && !apiError;
  const allSucceeded = hasResult && failed === 0 && succeeded > 0;
  const partial      = hasResult && succeeded > 0 && failed > 0;
  const allFailed    = hasResult && succeeded === 0 && failed > 0;

  return (
    <div className={styles.page}>
      <Link to="/partner/dashboard" className={styles.back}><FaArrowLeft /> Dashboard</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Import Leads</h1>
        <p className={styles.subtitle}>Upload an Excel file with student leads — they'll be tracked under your account</p>
      </div>

      <Card padding="lg" style={{ marginBottom: '2rem' }}>
        <p className={styles.sectionTitle}>UPLOAD EXCEL FILE</p>
        <hr style={{ borderColor: 'var(--border)', marginBottom: '1.5rem' }} />

        {apiError   && <div className={styles.errorBanner}>❌ {apiError}</div>}
        {allFailed  && <div className={styles.errorBanner}>❌ All {failed} of {total} rows failed. Check errors below.</div>}
        {partial    && <div className={styles.warnBanner}>⚠️ {succeeded} of {total} rows imported. {failed} rows failed.</div>}
        {allSucceeded && (
          <div className={styles.successBanner}>
            ✅ {succeeded} lead{succeeded !== 1 ? 's' : ''} imported successfully!
            <Link to="/partner/leads" className={styles.viewLink}>View My Leads →</Link>
          </div>
        )}

        {errors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button className={styles.toggleErrors} onClick={() => setShowErrors(v => !v)}>
              {showErrors ? '▲ Hide' : '▼ Show'} {errors.length} row error{errors.length !== 1 ? 's' : ''}
            </button>
            {showErrors && (
              <div className={styles.errorList}>
                <div className={styles.errorHead}><span>Row</span><span>Field</span><span>Error</span></div>
                {errors.slice(0, 100).map((e, i) => (
                  <div key={i} className={styles.errorRow}>
                    <span>#{e.row}</span><span>{e.field || '—'}</span><span>{e.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={styles.field}>
          <label>Excel File (.xlsx) <span>*</span></label>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className={styles.fileInput}
            onChange={e => { setFile(e.target.files[0] || null); setImportResult(null); }}
          />
          <small className={styles.hint}>Only .xlsx or .xls accepted</small>
        </div>

        {/* Column guide */}
        <details className={styles.colGuide}>
          <summary className={styles.colGuideSummary}>View required & optional columns</summary>
          <div className={styles.colGuideBody}>
            <div className={styles.colGroup}>
              <span className={styles.colLabel}>Required</span>
              <div className={styles.colTags}>
                {COLUMN_GUIDE.required.map(c => <code key={c} className={styles.colRequired}>{c}</code>)}
              </div>
            </div>
            <div className={styles.colGroup}>
              <span className={styles.colLabel}>Optional</span>
              <div className={styles.colTags}>
                {COLUMN_GUIDE.optional.map(c => <code key={c} className={styles.colOptional}>{c}</code>)}
              </div>
            </div>
          </div>
        </details>

        <div className={styles.actions}>
          <button className={styles.templateBtn} onClick={() => downloadTemplate(MODEL)} disabled={downloading}>
            ↓ Download Template
          </button>
          <Button variant="primary" onClick={handleImport} loading={importing} disabled={!file || importing}>
            {importing ? 'Importing…' : 'Import Leads'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
