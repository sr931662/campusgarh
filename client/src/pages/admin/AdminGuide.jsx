import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminGuide.module.css';

const Section = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
};

const Tag = ({ children, type = 'required' }) => (
  <code className={`${styles.tag} ${styles[type]}`}>{children}</code>
);

const AdminGuide = () => (
  <div className={styles.container}>
    <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
    <div className={styles.header}>
      <h1>Admin Resource Guide</h1>
      <p>Step-by-step reference for managing Colleges, Courses, Exams, and Blogs — both manually and via Excel import.</p>
    </div>

    {/* ── METHOD 1: MANUAL ── */}
    <Section title="Method 1 — Manual Management (Add / Delete)" defaultOpen>
      <p className={styles.intro}>Use the Manage pages from your dashboard Quick Actions for one-off additions or deletions.</p>
      <div className={styles.stepsGrid}>
        <div className={styles.step}>
          <div className={styles.stepNum}>1</div>
          <div>
            <strong>Open the Manage page</strong>
            <p>Go to Dashboard → Quick Actions → <em>Manage Colleges / Courses / Exams / Blogs</em></p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>2</div>
          <div>
            <strong>To Add a record</strong>
            <p>Click the <strong>+ Add</strong> button (top right). Fill the form carefully — required fields are marked with *.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>3</div>
          <div>
            <strong>To Delete a record</strong>
            <p>Find the row in the table and click <strong>Delete</strong>. A confirmation prompt will appear — this is permanent.</p>
          </div>
        </div>
      </div>
      <div className={styles.callout}>
        <strong>Note:</strong> Editing is not available in the Manage pages. To update a record, delete it and re-add it with correct data — or use Excel import/export (Method 2).
      </div>
    </Section>

    {/* ── METHOD 2: EXCEL ── */}
    <Section title="Method 2 — Excel Bulk Import / Export" defaultOpen>
      <p className={styles.intro}>Use this for bulk additions or updates. Go to Dashboard → <Link to="/admin/import">Import Data</Link>.</p>
      <div className={styles.stepsGrid}>
        <div className={styles.step}>
          <div className={styles.stepNum}>1</div>
          <div>
            <strong>Download the Template</strong>
            <p>On the Import Data page, scroll to <em>"Download Import Templates"</em> and download the template for your resource type. It includes correct headers, a sample row, and a Notes sheet with valid values.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>2</div>
          <div>
            <strong>Fill the Excel file</strong>
            <p>Keep the header row exactly as-is. Fill data from row 2 onwards. Leave optional columns blank — do not delete their column header. Use only the allowed values listed below for enum fields.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>3</div>
          <div>
            <strong>Import the file</strong>
            <p>Select the resource type from the dropdown, choose your filled <code>.xlsx</code> file, and click <strong>Import</strong>. Wait for the result banner.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>4</div>
          <div>
            <strong>Review errors (if any)</strong>
            <p>If rows failed, click <em>"Show row errors"</em>. Fix those rows in your Excel and re-import only the failed rows — already-imported rows will be skipped (duplicate check is on name/title).</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNum}>5</div>
          <div>
            <strong>Export to update existing records</strong>
            <p>Use <em>"Export to Excel"</em> to download the current database. Edit the rows you want changed, then re-import. Existing records with the same name are updated, not duplicated.</p>
          </div>
        </div>
      </div>
      <div className={styles.callout}>
        <strong>Golden rule:</strong> Always start from the downloaded template — never create the Excel from scratch. Column headers must match exactly (case-insensitive is fine).
      </div>
    </Section>

    {/* ── COLLEGES REFERENCE ── */}
    <Section title="Colleges — Valid Field Values">
      <div className={styles.fieldGroup}>
        <h4>Discipline / Stream <span className={styles.colName}>(column: "Discipline (College Type)")</span></h4>
        <div className={styles.tagRow}>
          {['Engineering & Technology','Medical & Health Sciences','Management & Business','Law',
            'Arts & Science','Architecture & Planning','Pharmacy','Agriculture',
            'Education & Teaching','Design & Fine Arts','Commerce & Finance','Technical','Multi-Disciplinary']
            .map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Institute Type <span className={styles.colName}>(column: "Institute Type (Funding Type)")</span></h4>
        <div className={styles.tagRow}>
          {['Government','Private','Semi-Government','Public-Private Partnership','Deemed University',
            'Private University','Central University','State University','Autonomous','Minority Institution']
            .map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Campus Type <span className={styles.colName}>(column: "Campus Type")</span></h4>
        <div className={styles.tagRow}>
          {['Urban','Semi-Urban','Rural','Suburban'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Admission Mode <span className={styles.colName}>(column: "Admission Mode")</span></h4>
        <div className={styles.tagRow}>
          {['Merit-Based','Entrance-Based','Both'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Boolean fields</h4>
        <p className={styles.note}>For columns like <code>NBA Status</code>, <code>Hostel Available</code>, <code>Featured</code>, <code>Verified</code> — use exactly: <Tag type="value">Yes</Tag> or <Tag type="value">No</Tag></p>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Approved By</h4>
        <p className={styles.note}>Comma-separated string. Common values: <Tag type="value">UGC</Tag> <Tag type="value">AICTE</Tag> <Tag type="value">NBA</Tag> <Tag type="value">NAAC</Tag> <Tag type="value">BCI</Tag> <Tag type="value">MCI</Tag> <Tag type="value">PCI</Tag></p>
      </div>
    </Section>

    {/* ── COURSES REFERENCE ── */}
    <Section title="Courses — Valid Field Values">
      <div className={styles.fieldGroup}>
        <h4>Academic Level <span className={styles.colName}>(column: "Level (UG/PG/Diploma/Doctorate/Certificate)")</span></h4>
        <div className={styles.tagRow}>
          {['UG','PG','Diploma','Doctorate','Certificate'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Mode <span className={styles.colName}>(column: "Mode (Full-time/Part-time/Online/Distance)")</span></h4>
        <div className={styles.tagRow}>
          {['Full-time','Part-time','Online','Distance'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Duration format</h4>
        <p className={styles.note}>Write as plain text string: <Tag type="value">4 Years</Tag> <Tag type="value">2 Years</Tag> <Tag type="value">18 Months</Tag> <Tag type="value">6 Months</Tag></p>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Admission Type <span className={styles.colName}>(column: "Admission Type")</span></h4>
        <div className={styles.tagRow}>
          {['Entrance-Based','Merit-Based','Direct Admission','Interview-Based'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
    </Section>

    {/* ── EXAMS REFERENCE ── */}
    <Section title="Exams — Valid Field Values">
      <div className={styles.fieldGroup}>
        <h4>Category <span className={styles.colName}>(column: "Category (UG/PG/PhD/Diploma)")</span></h4>
        <div className={styles.tagRow}>
          {['UG','PG','PhD','Diploma'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Exam Level <span className={styles.colName}>(column: "Exam Level (National/State/University-Level)")</span></h4>
        <div className={styles.tagRow}>
          {['National','State','University-Level','Institute-Level'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Exam Mode</h4>
        <div className={styles.tagRow}>
          {['Online (CBT)','Offline (OMR)','Online + Offline','Remote Proctored'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Frequency</h4>
        <div className={styles.tagRow}>
          {['Annual','Twice a Year','Multiple Times','As per notification'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
    </Section>

    {/* ── BLOGS REFERENCE ── */}
    <Section title="Blogs — Valid Field Values">
      <div className={styles.fieldGroup}>
        <h4>Status <span className={styles.colName}>(column: "Status (draft/published)")</span></h4>
        <div className={styles.tagRow}>
          {['draft','published'].map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Content Type</h4>
        <div className={styles.tagRow}>
          {['Guide','News','Ranking','College Review','Exam Update','Career Advice','Scholarship','Comparison']
            .map(v => <Tag key={v} type="value">{v}</Tag>)}
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <h4>Tags</h4>
        <p className={styles.note}>Comma-separated string. Example: <Tag type="value">JEE, IIT, Engineering, Admission</Tag></p>
      </div>
    </Section>

    {/* ── COMMON ERRORS ── */}
    <Section title="Common Errors & How to Fix Them">
      <table className={styles.errTable}>
        <thead>
          <tr><th>Error message</th><th>What went wrong</th><th>Fix</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>Validation failed: collegeType</code></td>
            <td>Discipline value doesn't match the allowed list</td>
            <td>Use exact values from the Colleges reference above (case-sensitive)</td>
          </tr>
          <tr>
            <td><code>Duplicate key / already exists</code></td>
            <td>A record with the same name is already in the DB</td>
            <td>The existing record will be updated — this is normal, not an error</td>
          </tr>
          <tr>
            <td><code>College Name is required</code></td>
            <td>Name column is empty for that row</td>
            <td>Fill the required column for every row</td>
          </tr>
          <tr>
            <td><code>Cast to Number failed</code></td>
            <td>A number field has text or currency symbols (₹, ,)</td>
            <td>Enter plain numbers only: <code>200000</code> not <code>₹2,00,000</code></td>
          </tr>
          <tr>
            <td><code>Cast to Date failed</code></td>
            <td>Date column has invalid format</td>
            <td>Use <code>YYYY-MM-DD</code> format: <code>2025-01-15</code></td>
          </tr>
          <tr>
            <td>Import succeeds but no records appear</td>
            <td>Wrong resource type selected in dropdown</td>
            <td>Make sure the dropdown matches your Excel file (e.g., Colleges file → select "Colleges")</td>
          </tr>
          <tr>
            <td>All rows fail with no specific error</td>
            <td>Column headers are wrong or file is corrupted</td>
            <td>Re-download the template and copy your data into it fresh</td>
          </tr>
        </tbody>
      </table>
    </Section>

    {/* ── QUICK LINKS ── */}
    <div className={styles.quickLinks}>
      <h3>Quick Links</h3>
      <div className={styles.quickLinksGrid}>
        <Link to="/admin/colleges" className={styles.quickLink}>Manage Colleges</Link>
        <Link to="/admin/courses"  className={styles.quickLink}>Manage Courses</Link>
        <Link to="/admin/exams"    className={styles.quickLink}>Manage Exams</Link>
        <Link to="/admin/blogs"    className={styles.quickLink}>Manage Blogs</Link>
        <Link to="/admin/import"   className={styles.quickLink}>Import / Export Data</Link>
      </div>
    </div>
  </div>
);

export default AdminGuide;
