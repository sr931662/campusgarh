import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { examService } from '../../services/examService';
import styles from './AdminForm.module.css';
import MarkdownField from '../../components/common/MarkdownField/MarkdownField';


// Matches Exam model enum exactly
const EXAM_CATEGORIES = ['UG', 'PG', 'PhD', 'Diploma'];

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
      name: '',
      category: '',
      overview: '',          // schema field is 'overview', not 'description'
      eligibility: '',
      officialWebsite: '',
      registrationFee: '',   // schema field is 'registrationFee', not 'applicationFee'
      syllabus: '',
      // importantDates — schema: array of { event: String, date: Date, link: String }
      regStartDate: '',
      regEndDate: '',
      examDate: '',
      resultDate: '',
      regStartLink: '',
      examDateLink: '',
      conductingBody: '',
      examLevel: '',
      examMode: '',
      examLanguages: '',     // comma-separated
      frequency: '',
      registrationFeeGeneral: '',
      registrationFeeOBC: '',
      registrationFeeSCST: '',
      registrationFeeFemale: '',
      registrationSteps: '',  // newline-separated
      documentsRequired: '',  // comma-separated
      counsellingBody: '',
      counsellingMode: '',
      counsellingOverview: '',
    });
    const [error, setError] = useState('');
    const { data: existing } = useQuery({
    queryKey: ['exam-edit', id],
    queryFn: () => examService.getExamById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!existing) return;
    const e = existing?.data?.data;
    if (!e) return;
    const dates = e.importantDates || [];
    const get = (event) => dates.find(d => d.event === event)?.date?.slice(0, 10) || '';
    const getLink = (event) => dates.find(d => d.event === event)?.link || '';
    setForm({
      name: e.name || '',
      category: e.category || '',
      overview: e.overview || '',
      eligibility: e.eligibility || '',
      officialWebsite: e.officialWebsite || '',
      registrationFee: e.registrationFee || '',
      syllabus: e.syllabus || '',
      regStartDate: get('Registration Start'),
      regEndDate: get('Registration End'),
      examDate: get('Exam Date'),
      resultDate: get('Result Date'),
      regStartLink: getLink('Registration Start'),
      examDateLink: getLink('Exam Date'),
      conductingBody: e.conductingBody || '',
      examLevel: e.examLevel || '',
      examMode: e.examMode || '',
      examLanguages: (e.examLanguages || []).join(', '),
      frequency: e.frequency || '',
      registrationFeeGeneral: e.registrationFeeDetails?.general || '',
      registrationFeeOBC: e.registrationFeeDetails?.obc || '',
      registrationFeeSCST: e.registrationFeeDetails?.sc_st || '',
      registrationFeeFemale: e.registrationFeeDetails?.female || '',
      registrationSteps: (e.registrationSteps || []).join('\n'),
      documentsRequired: (e.documentsRequired || []).join(', '),
      counsellingBody: e.counsellingInfo?.conductingBody || '',
      counsellingMode: e.counsellingInfo?.mode || '',
      counsellingOverview: e.counsellingInfo?.overview || '',
    });
  }, [existing]);


  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? examService.updateExam(id, data)
      : examService.createExam(data),
    onSuccess: () => navigate('/dashboard/admin'),
    onError: (err) => setError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} exam`),
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Build importantDates as array of { event, date, link }
    const importantDates = [];
    if (form.regStartDate) importantDates.push({ event: 'Registration Start', date: form.regStartDate, link: form.regStartLink || undefined });
    if (form.regEndDate) importantDates.push({ event: 'Registration End', date: form.regEndDate });
    if (form.examDate) importantDates.push({ event: 'Exam Date', date: form.examDate, link: form.examDateLink || undefined });
    if (form.resultDate) importantDates.push({ event: 'Result Date', date: form.resultDate });

    const payload = {
      name: form.name,
      category: form.category || undefined,
      overview: form.overview || undefined,
      eligibility: form.eligibility || undefined,
      officialWebsite: form.officialWebsite || undefined,
      registrationFee: form.registrationFee ? Number(form.registrationFee) : undefined,
      syllabus: form.syllabus || undefined,
      importantDates,
      conductingBody: form.conductingBody || undefined,
      examLevel: form.examLevel || undefined,
      examMode: form.examMode || undefined,
      examLanguages: form.examLanguages ? form.examLanguages.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      frequency: form.frequency || undefined,
      registrationFeeDetails: {
        general: form.registrationFeeGeneral ? Number(form.registrationFeeGeneral) : undefined,
        obc: form.registrationFeeOBC ? Number(form.registrationFeeOBC) : undefined,
        sc_st: form.registrationFeeSCST ? Number(form.registrationFeeSCST) : undefined,
        female: form.registrationFeeFemale ? Number(form.registrationFeeFemale) : undefined,
      },
      registrationSteps: form.registrationSteps ? form.registrationSteps.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      documentsRequired: form.documentsRequired ? form.documentsRequired.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      counsellingInfo: {
        conductingBody: form.counsellingBody || undefined,
        mode: form.counsellingMode || undefined,
        overview: form.counsellingOverview || undefined,
      },
    };
    mutation.mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Exam' : 'Add New Exam'}</h1>
        <p>{isEditing ? 'Update exam details below' : 'Fill in the details to add an entrance exam to the platform'}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Basic Information</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Exam Name <span>*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Joint Entrance Examination Advanced" />
            </div>
            <div className={styles.field}>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {EXAM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Official Website</label>
              <input name="officialWebsite" type="url" value={form.officialWebsite} onChange={handleChange} placeholder="https://jeeadv.ac.in" />
            </div>
            <div className={styles.field}>
              <label>Registration Fee (INR)</label>
              <input name="registrationFee" type="number" value={form.registrationFee} onChange={handleChange} placeholder="e.g. 650" min="0" />
            </div>
          </div>
          <div className={styles.field}>
            {/* <label>Overview</label> */}
            <MarkdownField
              label="Overview / Description"
              name="overview"
              value={form.overview}
              onChange={handleChange}
              placeholder="Full overview of the exam, its purpose, conducting body, eligibility..."
              rows={6}
            />

          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Eligibility & Syllabus</div>
          <div className={styles.field}>
            <label>Eligibility Criteria</label>
            <textarea name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. 10+2 with PCM, minimum 75%..." rows={3} />
          </div>
          <div className={styles.field}>
            <label>Syllabus</label>
            <textarea name="syllabus" value={form.syllabus} onChange={handleChange} placeholder="Physics: Mechanics, Optics... Chemistry: Organic..." rows={4} />
          </div>
        </div>

        {/* Conducting Body & Meta */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Exam Meta</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Conducting Body</label>
              <input name="conductingBody" value={form.conductingBody} onChange={handleChange} placeholder="e.g. NTA, CBSE, IIT Bombay" />
            </div>
            <div className={styles.field}>
              <label>Exam Level</label>
              <select name="examLevel" value={form.examLevel} onChange={handleChange}>
                <option value="">Select</option>
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="University-Level">University-Level</option>
                <option value="Institute-Level">Institute-Level</option>
              </select>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Exam Mode</label>
              <select name="examMode" value={form.examMode} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Online (CBT)">Online (CBT)</option>
                <option value="Offline (OMR)">Offline (OMR)</option>
                <option value="Online + Offline">Online + Offline</option>
                <option value="Remote Proctored">Remote Proctored</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Frequency</label>
              <select name="frequency" value={form.frequency} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Annual">Annual</option>
                <option value="Twice a Year">Twice a Year</option>
                <option value="Multiple Times">Multiple Times</option>
                <option value="As per notification">As per notification</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Languages Available (comma-separated)</label>
            <input name="examLanguages" value={form.examLanguages} onChange={handleChange} placeholder="e.g. English, Hindi, Gujarati" />
          </div>
        </div>

        {/* Registration Fee Details */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Category-wise Registration Fee (₹)</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>General / EWS</label>
              <input name="registrationFeeGeneral" type="number" value={form.registrationFeeGeneral} onChange={handleChange} placeholder="e.g. 1000" min="0" />
            </div>
            <div className={styles.field}>
              <label>OBC-NCL</label>
              <input name="registrationFeeOBC" type="number" value={form.registrationFeeOBC} onChange={handleChange} placeholder="e.g. 800" min="0" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>SC / ST / PwD</label>
              <input name="registrationFeeSCST" type="number" value={form.registrationFeeSCST} onChange={handleChange} placeholder="e.g. 500" min="0" />
            </div>
            <div className={styles.field}>
              <label>Female (All Categories)</label>
              <input name="registrationFeeFemale" type="number" value={form.registrationFeeFemale} onChange={handleChange} placeholder="e.g. 500" min="0" />
            </div>
          </div>
        </div>

        {/* How to Apply Steps */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Registration Steps & Documents</div>
          <div className={styles.field}>
            <label>Registration Steps (one step per line)</label>
            <textarea name="registrationSteps" value={form.registrationSteps} onChange={handleChange} placeholder={"Visit official website\nClick on Register\nFill application form\nUpload documents\nPay application fee"} rows={5} />
          </div>
          <div className={styles.field}>
            <label>Documents Required (comma-separated)</label>
            <input name="documentsRequired" value={form.documentsRequired} onChange={handleChange} placeholder="e.g. Class 12 Marksheet, Aadhar Card, Passport Photo" />
          </div>
        </div>

        {/* Counselling */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Counselling Information</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Counselling Body</label>
              <input name="counsellingBody" value={form.counsellingBody} onChange={handleChange} placeholder="e.g. JoSAA, CSAB, State CEA" />
            </div>
            <div className={styles.field}>
              <label>Counselling Mode</label>
              <select name="counsellingMode" value={form.counsellingMode} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <MarkdownField
              label="Counselling Overview"
              name="counsellingOverview"
              value={form.counsellingOverview}
              onChange={handleChange}
              placeholder="How the counselling process works..."
              rows={4}
            />

          </div>
        </div>

        {/* importantDates — array of {event, date, link} */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Important Dates</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Registration Start</label>
              <input name="regStartDate" type="date" value={form.regStartDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Registration Start Link</label>
              <input name="regStartLink" type="url" value={form.regStartLink} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Registration End</label>
              <input name="regEndDate" type="date" value={form.regEndDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Exam Date</label>
              <input name="examDate" type="date" value={form.examDate} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Result Date</label>
              <input name="resultDate" type="date" value={form.resultDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Exam Date Link</label>
              <input name="examDateLink" type="url" value={form.examDateLink} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Exam' : 'Create Exam')}
          </button>
          <Link to="/dashboard/admin" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
