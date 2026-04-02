import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUserProfile, useUpdateProfile, useUpdateAcademicDetails, useUpdatePreferences, useRequestRoleChange, useMyRoleRequests } from '../hooks/queries';
import Button from '../components/common/Button/Button';
import Loader from '../components/common/Loader/Loader';
import styles from './UserProfile.module.css';

const TABS = ['Basic Info', 'Academic', 'Preferences', 'Role & Account'];
const ROLE_LABELS = { student: 'Student', counsellor: 'Counsellor / Advisor', institution_rep: 'Institution Representative', admin: 'Admin', moderator: 'Moderator' };
const REQUESTABLE_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'counsellor', label: 'Counsellor / Advisor' },
  { value: 'institution_rep', label: 'Institution Representative' },
];

const ROLE_PERKS = {
  student: {
    accentColor: '#10b981', bg: '#f0fdf4', borderColor: '#bbf7d0',
    headingColor: '#065f46',
    title: 'As a Student, you have access to:',
    perks: [
      { icon: '🔍', label: 'College Discovery',      desc: 'Browse 500+ colleges filtered by stream, state, and budget.' },
      { icon: '⚡', label: 'Admission Predictor',    desc: 'Personalised college, course, and exam predictions by score.' },
      { icon: '📑', label: 'Course Explorer',        desc: 'Explore UG, PG, Diploma courses across all disciplines.' },
      { icon: '💾', label: 'Save & Compare',         desc: 'Bookmark colleges and compare them side-by-side.' },
    ],
  },
  counsellor: {
    accentColor: '#3b82f6', bg: '#eff6ff', borderColor: '#bfdbfe',
    headingColor: '#1d4ed8',
    title: 'As a Counsellor / Advisor, you have access to:',
    perks: [
      { icon: '📋', label: 'Lead Management',        desc: 'View and act on every student enquiry assigned to you.' },
      { icon: '📞', label: 'Follow-up Tracker',      desc: 'Set follow-up dates and track all your student conversations.' },
      { icon: '🗂️', label: 'Pipeline Status',        desc: 'Update lead stages — Contacted, Interested, Converted, Closed.' },
      { icon: '🎓', label: 'Full Platform Access',   desc: 'All college, course, and exam data to advise students better.' },
    ],
  },
  institution_rep: {
    accentColor: '#8b5cf6', bg: '#f5f3ff', borderColor: '#ddd6fe',
    headingColor: '#5b21b6',
    title: 'As an Institution Representative, you have access to:',
    perks: [
      { icon: '🏫', label: 'College Profile Control',  desc: "Update your institution's description, photos, and key details." },
      { icon: '📚', label: 'Course & Fee Management',  desc: 'Add or edit courses offered, annual fees, and seat intake.' },
      { icon: '📈', label: 'Placement & Stats View',   desc: 'Showcase year-wise placement and admission trend data.' },
      { icon: '💬', label: 'Student Enquiry Inbox',    desc: 'Receive and respond to enquiries directed at your institution.' },
    ],
  },
  partner: {
    accentColor: '#C9A84C', bg: '#FBF8F2', borderColor: '#EDE8E0',
    headingColor: '#92400e',
    title: 'As a Partner (Publisher), you have access to:',
    perks: [
      { icon: '🚀', label: 'Lead Submission',          desc: 'Refer students individually or via bulk Excel import.' },
      { icon: '💰', label: 'Commission Earnings',      desc: 'Get paid for every student whose admission is confirmed through you.' },
      { icon: '📊', label: 'Real-time Lead Tracking',  desc: 'Monitor lead status and conversion live in your dashboard.' },
      { icon: '🔗', label: 'Partner Analytics',        desc: 'Conversion rate, total leads, and pipeline breakdown.' },
    ],
  },
};


const UserProfile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { data: userData, isLoading } = useUserProfile();
  const updateProfile      = useUpdateProfile();
  const updateAcademic     = useUpdateAcademicDetails();
  const updatePreferences  = useUpdatePreferences();
  const requestRoleChange  = useRequestRoleChange();
  const { data: roleReqRes } = useMyRoleRequests();

  const basicForm   = useForm();
  const academicForm = useForm();
  const prefForm    = useForm();
  const roleForm    = useForm();

  if (isLoading) return <Loader />;
  const user = userData?.data?.data || userData?.data;
  if (!user) return <div>Could not load profile.</div>;

  const roleRequests = Array.isArray(roleReqRes?.data?.data) ? roleReqRes.data.data
    : Array.isArray(roleReqRes?.data) ? roleReqRes.data : [];
  const hasPending = roleRequests.some(r => r.status === 'pending');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>{user.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className={styles.name}>{user.name}</h1>
          <span className={styles.roleBadge}>{ROLE_LABELS[user.role] || user.role}</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button key={tab} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`} onClick={() => setActiveTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.card}>

        {/* ── Tab 0: Basic Info ── */}
        {activeTab === 0 && (
          <form onSubmit={basicForm.handleSubmit(d => updateProfile.mutate(d))} className={styles.form}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input {...basicForm.register('name', { required: true })} defaultValue={user.name} />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input {...basicForm.register('phone')} defaultValue={user.phone} placeholder="10-digit number" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Email <span className={styles.locked}>(cannot be changed)</span></label>
              <input value={user.email} disabled />
            </div>
            <Button type="submit" variant="primary" loading={updateProfile.isPending}>Save Changes</Button>
          </form>
        )}

        {/* ── Tab 1: Academic ── */}
        {activeTab === 1 && (
          <form onSubmit={academicForm.handleSubmit(d => updateAcademic.mutate(d))} className={styles.form}>
            <h2 className={styles.sectionTitle}>Academic Background</h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Highest Qualification</label>
                <input {...academicForm.register('qualification')} defaultValue={user.academicBackground?.qualification} placeholder="e.g. 12th, Diploma, B.Tech" />
              </div>
              <div className={styles.formGroup}>
                <label>Stream</label>
                <input {...academicForm.register('stream')} defaultValue={user.academicBackground?.stream} placeholder="e.g. Science, Commerce" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Institution</label>
                <input {...academicForm.register('institution')} defaultValue={user.academicBackground?.institution} />
              </div>
              <div className={styles.formGroup}>
                <label>Board</label>
                <input {...academicForm.register('board')} defaultValue={user.academicBackground?.board} placeholder="CBSE / ICSE / State" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Year of Passing</label>
                <input type="number" {...academicForm.register('yearOfPassing')} defaultValue={user.academicBackground?.yearOfPassing} />
              </div>
              <div className={styles.formGroup}>
                <label>Percentage / CGPA</label>
                <input type="number" step="0.01" {...academicForm.register('percentage')} defaultValue={user.academicBackground?.percentage} />
              </div>
            </div>
            <Button type="submit" variant="primary" loading={updateAcademic.isPending}>Save Academic Details</Button>
          </form>
        )}

        {/* ── Tab 2: Preferences ── */}
        {activeTab === 2 && (
          <form onSubmit={prefForm.handleSubmit(d => {
            const payload = {
              preferredCities: d.preferredCities?.split(',').map(s => s.trim()).filter(Boolean),
              preferredStates: d.preferredStates?.split(',').map(s => s.trim()).filter(Boolean),
              interests:       d.interests?.split(',').map(s => s.trim()).filter(Boolean),
              budgetRange:     { min: +d.budgetMin || 0, max: +d.budgetMax || 0 },
            };
            updatePreferences.mutate(payload);
          })} className={styles.form}>
            <h2 className={styles.sectionTitle}>Preferences</h2>
            <div className={styles.formGroup}>
              <label>Preferred Cities <span className={styles.hint}>(comma-separated)</span></label>
              <input {...prefForm.register('preferredCities')} defaultValue={user.preferredCities?.join(', ')} placeholder="Delhi, Mumbai, Bangalore" />
            </div>
            <div className={styles.formGroup}>
              <label>Preferred States <span className={styles.hint}>(comma-separated)</span></label>
              <input {...prefForm.register('preferredStates')} defaultValue={user.preferredStates?.join(', ')} placeholder="Delhi, Maharashtra" />
            </div>
            <div className={styles.formGroup}>
              <label>Interests <span className={styles.hint}>(comma-separated)</span></label>
              <input {...prefForm.register('interests')} defaultValue={user.interests?.join(', ')} placeholder="engineering, management, medical" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Budget Min (₹/year)</label>
                <input type="number" {...prefForm.register('budgetMin')} defaultValue={user.budgetRange?.min} />
              </div>
              <div className={styles.formGroup}>
                <label>Budget Max (₹/year)</label>
                <input type="number" {...prefForm.register('budgetMax')} defaultValue={user.budgetRange?.max} />
              </div>
            </div>
            <Button type="submit" variant="primary" loading={updatePreferences.isPending}>Save Preferences</Button>
          </form>
        )}

        {/* ── Tab 3: Role & Account ── */}
        {activeTab === 3 && (
          <div className={styles.form}>
            <h2 className={styles.sectionTitle}>Role & Account</h2>
            <div className={styles.currentRole}>
              <span className={styles.roleLabel}>Current Role:</span>
              <span className={styles.roleBadge}>{ROLE_LABELS[user.role] || user.role}</span>
            </div>
            {ROLE_PERKS[user.role] && (() => {
              const rp = ROLE_PERKS[user.role];
              return (
                <div className={styles.rolePerksBox}
                  style={{ background: rp.bg, borderColor: rp.borderColor, borderLeftColor: rp.accentColor }}>
                  <p className={styles.rolePerksTitle} style={{ color: rp.accentColor }}>{rp.title}</p>
                  <ul className={styles.rolePerksGrid}>
                    {rp.perks.map((perk, i) => (
                      <li key={i} className={styles.rolePerkItem} style={{ borderColor: rp.borderColor }}>
                        <span className={styles.rolePerkIcon}>{perk.icon}</span>
                        <div>
                          <strong style={{ color: rp.headingColor }}>{perk.label}</strong>
                          <span>{perk.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}


            {['admin', 'moderator'].includes(user.role) ? (
              <p className={styles.infoNote}>Your role is managed by the platform. Contact support for changes.</p>
            ) : hasPending ? (
              <div className={styles.pendingBox}>
                <strong>Role change request pending</strong>
                <p>Your request is under admin review. You'll be notified once it's processed.</p>
              </div>
            ) : (
              <form onSubmit={roleForm.handleSubmit(d => requestRoleChange.mutate(d))} className={styles.roleForm}>
                <p className={styles.infoNote}>Want to switch your role? Submit a request below — admin approval required.</p>
                <div className={styles.formGroup}>
                  <label>Request Role</label>
                  <select {...roleForm.register('requestedRole', { required: true })} defaultValue="">
                    <option value="" disabled>Select a role</option>
                    {REQUESTABLE_ROLES.filter(r => r.value !== user.role).map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Reason</label>
                  <textarea {...roleForm.register('reason', { required: true, maxLength: 500 })} rows={3} placeholder="Briefly explain why you want this role..." />
                </div>
                <Button type="submit" variant="primary" loading={requestRoleChange.isPending}>Submit Request</Button>
              </form>
            )}

            {roleRequests.length > 0 && (
              <div className={styles.requestHistory}>
                <h3>Request History</h3>
                {roleRequests.map(r => (
                  <div key={r._id} className={`${styles.requestCard} ${styles['req_' + r.status]}`}>
                    <div><strong>{ROLE_LABELS[r.requestedRole]}</strong> — <span className={styles[r.status]}>{r.status}</span></div>
                    <div className={styles.reqMeta}>{r.reason}</div>
                    {r.reviewNote && <div className={styles.reqNote}>Admin note: {r.reviewNote}</div>}
                    <div className={styles.reqDate}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
