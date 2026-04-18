import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collegeService } from '../../services/collegeService';
import { courseService } from '../../services/courseService';
import { examService } from '../../services/examService';
import { useCoursesForCollege, useCreateCollegeCourse, useDeleteCollegeCourse } from '../../hooks/queries';
import Loader from '../../components/common/Loader/Loader';
import styles from './AdminCollegeCourses.module.css';

const EMPTY_FORM = {
  course: '',
  fees: '',
  seatIntake: '',
  eligibility: '',
  cutoff: '',
  entranceExamRequirement: [],
};

const AdminCollegeCourses = () => {
  const { collegeId } = useParams();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const { data: collegeRes } = useQuery({
    queryKey: ['college-admin', collegeId],
    queryFn: () => collegeService.getCollegeById(collegeId),
    enabled: !!collegeId,
  });

  const { data: coursesListRes } = useQuery({
    queryKey: ['courses-all'],
    queryFn: () => courseService.getCourses({ limit: 200 }),
  });

  const { data: examsListRes } = useQuery({
    queryKey: ['exams-all'],
    queryFn: () => examService.getExams({ limit: 200 }),
  });

  const { data: mappingsRes, isLoading } = useCoursesForCollege(collegeId);

  const createMutation = useCreateCollegeCourse();
  const deleteMutation = useDeleteCollegeCourse();

  const college = collegeRes?.data?.data;
  const allCourses = coursesListRes?.data?.data?.data || [];
  const allExams = examsListRes?.data?.data?.data || [];
  const mappings = mappingsRes?.data?.data || [];

  const handleExamToggle = (examId) => {
    setForm(prev => {
      const already = prev.entranceExamRequirement.includes(examId);
      return {
        ...prev,
        entranceExamRequirement: already
          ? prev.entranceExamRequirement.filter(id => id !== examId)
          : [...prev.entranceExamRequirement, examId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.course) return;
    createMutation.mutate(
      {
        college: collegeId,
        course: form.course,
        fees: form.fees ? Number(form.fees) : undefined,
        seatIntake: form.seatIntake ? Number(form.seatIntake) : undefined,
        eligibility: form.eligibility || undefined,
        cutoff: form.cutoff || undefined,
        entranceExamRequirement: form.entranceExamRequirement,
      },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <Link to="/admin/colleges" className={styles.backLink}>← Back to Colleges</Link>

      <div className={styles.header}>
        <div>
          <h1>Course Mappings</h1>
          {college && <p className={styles.subtitle}>{college.name}</p>}
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ Add Course'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>Add Course to College</h2>

          <div className={styles.field}>
            <label>Course <span className={styles.required}>*</span></label>
            <select
              value={form.course}
              onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
              required
            >
              <option value="">— Select a course —</option>
              {allCourses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Annual Fees (₹)</label>
              <input
                type="number"
                value={form.fees}
                onChange={e => setForm(p => ({ ...p, fees: e.target.value }))}
                placeholder="e.g. 120000"
              />
            </div>
            <div className={styles.field}>
              <label>Seat Intake</label>
              <input
                type="number"
                value={form.seatIntake}
                onChange={e => setForm(p => ({ ...p, seatIntake: e.target.value }))}
                placeholder="e.g. 60"
              />
            </div>
            <div className={styles.field}>
              <label>Cutoff</label>
              <input
                type="text"
                value={form.cutoff}
                onChange={e => setForm(p => ({ ...p, cutoff: e.target.value }))}
                placeholder="e.g. 85 percentile"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Eligibility</label>
            <input
              type="text"
              value={form.eligibility}
              onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))}
              placeholder="e.g. 10+2 with PCM, min 60%"
            />
          </div>

          <div className={styles.field}>
            <label>Entrance Exams Accepted</label>
            <div className={styles.examCheckboxGrid}>
              {allExams.map(exam => (
                <label key={exam._id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.entranceExamRequirement.includes(exam._id)}
                    onChange={() => handleExamToggle(exam._id)}
                  />
                  {exam.name}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add Mapping'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader />
      ) : mappings.length === 0 ? (
        <div className={styles.empty}>No courses mapped to this college yet.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Fees / yr</th>
                <th>Seats</th>
                <th>Cutoff</th>
                <th>Entrance Exams</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map(m => (
                <tr key={m._id}>
                  <td>
                    <div className={styles.courseName}>{m.course?.name || '—'}</div>
                    {m.course?.discipline && <div className={styles.courseSub}>{m.course.discipline}</div>}
                  </td>
                  <td>{m.fees ? `₹${m.fees.toLocaleString('en-IN')}` : '—'}</td>
                  <td>{m.seatIntake || '—'}</td>
                  <td>{m.cutoff || '—'}</td>
                  <td>
                    <div className={styles.examTags}>
                      {m.entranceExamRequirement?.length > 0
                        ? m.entranceExamRequirement.map(ex => (
                            <span key={ex._id || ex} className={styles.examTag}>{ex.name || ex}</span>
                          ))
                        : <span className={styles.none}>None</span>}
                    </div>
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Remove "${m.course?.name}" from this college?`)) {
                          deleteMutation.mutate({ mappingId: m._id, collegeId });
                        }
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCollegeCourses;
