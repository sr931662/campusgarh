import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useImportExcel, useExportExcel, useImportLogs } from '../../hooks/queries';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import styles from './ImportData.module.css';

const MODELS = [
  { value: 'College',          label: 'Colleges' },
  { value: 'Course',           label: 'Courses' },
  { value: 'Exam',             label: 'Exams' },
  { value: 'Blog',             label: 'Blogs' },
  { value: 'AdmissionEnquiry', label: 'Enquiries' },
];

const VIEW_LINKS = {
  College: '/colleges',
  Course:  '/courses',
  Exam:    '/exams',
  Blog:    '/blogs',
};

export default function ImportData() {
  const [model, setModel]               = useState('College');
  const [file, setFile]                 = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showErrors, setShowErrors]     = useState(false);
  const fileRef = useRef();

  const { mutate: importExcel, isPending: importing } = useImportExcel();
  const { mutate: exportExcel, isPending: exporting } = useExportExcel();
  const { data: logsData } = useImportLogs({ limit: 10 });

  // Normalize the nested response shape the API returns
  const logs = logsData?.data?.data?.data ?? logsData?.data?.data ?? [];

  const handleImport = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('model', model);

    importExcel(
      { formData: fd, model }, // model is passed through so the hook can bust the right cache
      {
        onSuccess: (axiosResponse) => {
          // Response chain:
          //   axiosResponse          = axios wrapper
          //   axiosResponse.data     = { success, message, data: {...} }  (ResponseHandler.success)
          //   axiosResponse.data.data = { batchId, totalRows, succeededRows, failedRows, importErrors }
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

  // Derived values from the actual payload object
  const apiError     = importResult?._error;
  const succeeded    = importResult?.succeededRows ?? 0;
  const failed       = importResult?.failedRows    ?? 0;
  const total        = importResult?.totalRows     ?? (succeeded + failed);
  const errors       = importResult?.importErrors  ?? [];
  const hasResult    = !!importResult && !apiError;
  const allFailed    = hasResult && succeeded === 0 && failed > 0;
  const partial      = hasResult && succeeded > 0  && failed > 0;
  const allSucceeded = hasResult && failed === 0   && succeeded > 0;
  const modelLabel   = MODELS.find(m => m.value === model)?.label ?? model;

  return (
    <div className={styles.container}>
      <Link to="/dashboard" className={styles.backLink}>← Back to Dashboard</Link>

      <div className={styles.header}>
        <h1>Import / Export Data</h1>
        <p>Bulk import records from Excel or export existing data</p>
      </div>

      {/* ─────────── IMPORT ─────────── */}
      <Card padding="lg" style={{ marginBottom: '2rem' }}>
        <p className={styles.sectionTitle}>IMPORT FROM EXCEL</p>
        <hr style={{ borderColor: 'var(--border)', marginBottom: '1.5rem' }} />

        {apiError && (
          <div className={styles.errorBanner}>❌ {apiError}</div>
        )}
        {allFailed && (
          <div className={styles.errorBanner}>
            ❌ All {failed} of {total} rows failed — nothing was saved. Check errors below.
          </div>
        )}
        {partial && (
          <div className={styles.warnBanner}>
            ⚠️ {succeeded} of {total} rows imported. {failed} rows failed — check errors below.
          </div>
        )}
        {allSucceeded && (
          <div className={styles.successBanner}>
            ✅ {succeeded} {modelLabel.toLowerCase()} imported successfully!
            {VIEW_LINKS[model] && (
              <Link to={VIEW_LINKS[model]} className={styles.viewLink}>
                View {modelLabel} →
              </Link>
            )}
          </div>
        )}

        {/* Per-row error table */}
        {errors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className={styles.toggleErrors}
              onClick={() => setShowErrors(v => !v)}
            >
              {showErrors ? '▲ Hide' : '▼ Show'} {errors.length} row error{errors.length !== 1 ? 's' : ''}
            </button>
            {showErrors && (
              <div className={styles.errorList}>
                <div className={styles.errorHead}>
                  <span>Row</span><span>Field</span><span>Error</span>
                </div>
                {errors.slice(0, 200).map((e, i) => (
                  <div key={i} className={styles.errorRow}>
                    <span>#{e.row}</span>
                    <span>{e.field || '—'}</span>
                    <span>{e.message}</span>
                  </div>
                ))}
                {errors.length > 200 && (
                  <p style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
                    … and {errors.length - 200} more errors.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label>Data Type <span>*</span></label>
            <select
              value={model}
              onChange={e => { setModel(e.target.value); setImportResult(null); }}
              className={styles.select}
            >
              {MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Excel File (.xlsx) <span>*</span></label>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className={styles.fileInput}
              onChange={e => { setFile(e.target.files[0] || null); setImportResult(null); }}
            />
            <small className={styles.hint}>Only .xlsx or .xls files accepted</small>
          </div>
        </div>

        <p className={styles.templateHint}>
          💡 Tip: Export existing data first to see the correct column names.
          Headers are matched case-insensitively with many accepted variations.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button
            variant="primary"
            onClick={handleImport}
            loading={importing}
            disabled={!file || importing}
          >
            {importing ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </Card>

      {/* ─────────── EXPORT ─────────── */}
      <Card padding="lg" style={{ marginBottom: '2rem' }}>
        <p className={styles.sectionTitle}>EXPORT TO EXCEL</p>
        <hr style={{ borderColor: 'var(--border)', marginBottom: '1.5rem' }} />
        <div className={styles.exportGrid}>
          {MODELS.map(m => (
            <button
              key={m.value}
              className={styles.exportBtn}
              onClick={() => exportExcel({ model: m.value })}
              disabled={exporting}
            >
              Export {m.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ─────────── RECENT LOGS ─────────── */}
      {logs.length > 0 && (
        <Card padding="lg">
          <p className={styles.sectionTitle}>RECENT IMPORTS</p>
          <hr style={{ borderColor: 'var(--border)', marginBottom: '1rem' }} />
          <div className={styles.logsTable}>
            <div className={styles.tableHead}>
              <span>Model</span><span>Status</span><span>Saved / Total</span><span>Date</span>
            </div>
            {logs.map(log => (
              <div key={log._id} className={styles.tableRow}>
                <span>{log.model}</span>
                <span className={
                  log.status === 'completed' ? styles.statusSuccess
                  : log.status === 'partial'  ? styles.statusWarn
                  : styles.statusFail
                }>
                  {log.status}
                </span>
                <span>{log.succeededRows ?? '—'} / {log.totalRows ?? '—'}</span>
                <span>{log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-IN') : '—'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}