import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import styles from './AdminForm.module.css';


// Matches Course model enum exactly
const COURSE_CATEGORIES = ['UG', 'PG', 'Diploma', 'Doctorate', 'Certificate'];
const COURSE_MODES = ['Full-time', 'Part-time', 'Online', 'Distance'];

const CreateCourse = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: '',        // academic level: UG/PG/Diploma/Doctorate/Certificate
    discipline: '',      // subject area: Engineering/Medical/Management etc.
    duration: '',        // plain string e.g. "4 Years"
    mode: '',
    description: '',
    eligibility: '',
    feeMin: '',
    feeMax: '',
    specializations: '',
    jobRoles: '',        // comma-separated
    skills: '',          // comma-separated
    admissionType: '',
    lateralEntryAvailable: false,
    lateralEntryEligibility: '',
    lateralEntryIntoYear: '',
    avgStartingSalary: '',
    growthRate: '',
    topSectors: '',      // comma-separated
    careerDescription: '',
  });
  const [error, setError] = useState('');
  const { data: existing } = useQuery({
    queryKey: ['course-edit', id],
    queryFn: () => courseService.getCourseById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!existing) return;
    const c = existing?.data?.data;
    if (!c) return;
    setForm({
      name: c.name || '',
      category: c.category || '',
      discipline: c.discipline || '',
      duration: c.duration || '',
      mode: c.mode || '',
      description: c.description || '',
      eligibility: c.eligibility || '',
      feeMin: c.feeRange?.min || '',
      feeMax: c.feeRange?.max || '',
      specializations: (c.specializations || []).join(', '),
      jobRoles: (c.jobRoles || []).join(', '),
      skills: (c.skills || []).join(', '),
      admissionType: c.admissionType || '',
      lateralEntryAvailable: c.lateralEntry?.available || false,
      lateralEntryEligibility: c.lateralEntry?.eligibility || '',
      lateralEntryIntoYear: c.lateralEntry?.intoYear || '',
      avgStartingSalary: c.careerProspects?.averageStartingSalary || '',
      growthRate: c.careerProspects?.growthRate || '',
      topSectors: (c.careerProspects?.topSectors || []).join(', '),
      careerDescription: c.careerProspects?.description || '',
    });
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? courseService.updateCourse(id, data)
      : courseService.createCourse(data),
    onSuccess: () => navigate('/dashboard/admin'),
    onError: (err) => setError(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} course`),
  });


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      category: form.category || undefined,
      discipline: form.discipline || undefined,
      duration: form.duration || undefined,
      mode: form.mode || undefined,
      description: form.description || undefined,
      eligibility: form.eligibility || undefined,
      feeRange: {
        min: form.feeMin ? Number(form.feeMin) : undefined,
        max: form.feeMax ? Number(form.feeMax) : undefined,
      },
      specializations: form.specializations
        ? form.specializations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      jobRoles: form.jobRoles ? form.jobRoles.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      admissionType: form.admissionType || undefined,
      lateralEntry: {
        available: form.lateralEntryAvailable,
        eligibility: form.lateralEntryEligibility || undefined,
        intoYear: form.lateralEntryIntoYear ? Number(form.lateralEntryIntoYear) : undefined,
      },
      careerProspects: {
        averageStartingSalary: form.avgStartingSalary ? Number(form.avgStartingSalary) : undefined,
        growthRate: form.growthRate || undefined,
        topSectors: form.topSectors ? form.topSectors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        description: form.careerDescription || undefined,
      },
    };
    mutation.mutate(payload);
  };

  return (
    <div className={styles.container}>
      <Link to="/dashboard/admin" className={styles.backLink}>← Back to Dashboard</Link>
      <div className={styles.header}>
        <h1>{isEditing ? 'Edit Course' : 'Add New Course'}</h1>
          <p>{isEditing ? 'Update course details below' : 'Fill in the details to add a course to the platform'}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Basic Information</div>
          <div className={styles.field}>
            <label>Course Name <span>*</span></label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. B.Tech Computer Science" />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Academic Level</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select level</option>
                {COURSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Discipline / Stream</label>
              <input name="discipline" value={form.discipline} onChange={handleChange} placeholder="e.g. Engineering, Medical, Management, Law" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Duration <span>*</span></label>
              <input name="duration" value={form.duration} onChange={handleChange} required placeholder="e.g. 4 Years, 2 Years, 6 Months" />
              <span className={styles.hint}>Enter as text: "4 Years", "18 Months", etc.</span>
            </div>
            <div className={styles.field}>
              <label>Mode</label>
              <select name="mode" value={form.mode} onChange={handleChange}>
                <option value="">Select mode</option>
                {COURSE_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Overview of the course, career prospects..." rows={4} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Eligibility & Specializations</div>
          <div className={styles.field}>
            <label>Eligibility Criteria</label>
            <textarea name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. 10+2 with PCM, minimum 75% aggregate..." rows={3} />
          </div>
          <div className={styles.field}>
            <label>Specializations</label>
            <input name="specializations" value={form.specializations} onChange={handleChange} placeholder="Computer Science, Data Science, AI, Robotics" />
            <span className={styles.hint}>Comma-separated list</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Fee Range (INR per year)</div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Minimum Fee</label>
              <input name="feeMin" type="number" value={form.feeMin} onChange={handleChange} placeholder="e.g. 100000" min="0" />
            </div>
            <div className={styles.field}>
              <label>Maximum Fee</label>
              <input name="feeMax" type="number" value={form.feeMax} onChange={handleChange} placeholder="e.g. 300000" min="0" />
            </div>
          </div>
        </div>

        {/* Career & Jobs */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Career & Job Prospects</div>
          <div className={styles.field}>
            <label>Job Roles (comma-separated)</label>
            <input name="jobRoles" value={form.jobRoles} onChange={handleChange} placeholder="e.g. Software Engineer, Data Analyst, Product Manager" />
          </div>
          <div className={styles.field}>
            <label>Key Skills (comma-separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. Python, Machine Learning, Data Structures" />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Admission Type</label>
              <select name="admissionType" value={form.admissionType} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Entrance-Based">Entrance-Based</option>
                <option value="Merit-Based">Merit-Based</option>
                <option value="Direct Admission">Direct Admission</option>
                <option value="Interview-Based">Interview-Based</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Avg Starting Salary (₹/year)</label>
              <input name="avgStartingSalary" type="number" value={form.avgStartingSalary} onChange={handleChange} placeholder="e.g. 600000" min="0" />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Industry Growth Rate</label>
              <input name="growthRate" value={form.growthRate} onChange={handleChange} placeholder="e.g. 25% YoY, High Growth" />
            </div>
          </div>
          <div className={styles.field}>
            <label>Top Sectors (comma-separated)</label>
            <input name="topSectors" value={form.topSectors} onChange={handleChange} placeholder="e.g. IT, Finance, Consulting, E-Commerce" />
          </div>
          <div className={styles.field}>
            <label>Career Description</label>
            <textarea name="careerDescription" value={form.careerDescription} onChange={handleChange} placeholder="Brief overview of career opportunities..." rows={3} />
          </div>
          <div className={styles.checkboxField}>
            <input type="checkbox" id="lateralEntryAvailable" name="lateralEntryAvailable" checked={form.lateralEntryAvailable} onChange={handleChange} />
            <label htmlFor="lateralEntryAvailable">Lateral Entry Available</label>
          </div>
          {form.lateralEntryAvailable && (
            <>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Direct Into Year</label>
                  <input name="lateralEntryIntoYear" type="number" value={form.lateralEntryIntoYear} onChange={handleChange} placeholder="e.g. 2" min="1" max="6" />
                </div>
                <div className={styles.field}>
                  <label>Lateral Entry Eligibility</label>
                  <input name="lateralEntryEligibility" value={form.lateralEntryEligibility} onChange={handleChange} placeholder="e.g. Diploma holders with 60% marks" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
            {mutation.isPending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Course' : 'Create Course')}
          </button>
          <Link to="/dashboard/admin" className={styles.cancelLink}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
