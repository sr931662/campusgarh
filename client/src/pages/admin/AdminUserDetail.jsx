import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import styles from './AdminUserDetail.module.css';

const { getUserById, adminUpdateUser } = userService;

const ROLES = ['student', 'admin', 'counsellor', 'moderator', 'institution_rep', 'partner'];

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
  });

  const user = data?.data?.data?.user;
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  if (user && !form) {
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'student',
      isActive: user.isActive,
      emailVerified: user.emailVerified,
    });
  }

  const updateMutation = useMutation({
    mutationFn: (data) => adminUpdateUser(userId, data),
    onSuccess: () => {
      qc.invalidateQueries(['user', userId]);
      qc.invalidateQueries(['admin-users']);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) return <div className={styles.loading}>Loading user...</div>;
  if (!user) return <div className={styles.notFound}>User not found.</div>;

  return (
    <div className={styles.page}>
      <button className={styles.backLink} onClick={() => navigate('/admin/users')}>
        ← Back to Users
      </button>

      {/* Profile Card */}
      <div className={styles.card}>
        <div className={styles.userHeader}>
          <div className={styles.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className={styles.userName}>{user.name}</h1>
            <p className={styles.userEmail}>{user.email}</p>
            <p className={styles.userMeta}>
              Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {user.lastLogin && ` · Last login ${new Date(user.lastLogin).toLocaleDateString('en-IN')}`}
            </p>
          </div>
        </div>

        {form && (
          <form onSubmit={e => { e.preventDefault(); updateMutation.mutate(form); }}>
            <h2 className={styles.sectionTitle}>Edit Profile</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className={styles.field}>
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  Active Account
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={e => setForm(f => ({ ...f, emailVerified: e.target.checked }))}
                  />
                  Email Verified
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={updateMutation.isPending} className={styles.submitBtn}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className={styles.savedMsg}>Saved successfully!</span>}
            </div>
          </form>
        )}
      </div>

      {/* Academic Background */}
      {user.academicBackground?.qualification && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Academic Background</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>Qualification: <strong>{user.academicBackground.qualification}</strong></div>
            <div className={styles.infoItem}>Stream: <strong>{user.academicBackground.stream || '—'}</strong></div>
            <div className={styles.infoItem}>Institution: <strong>{user.academicBackground.institution || '—'}</strong></div>
            <div className={styles.infoItem}>Percentage: <strong>{user.academicBackground.percentage || '—'}</strong></div>
          </div>
        </div>
      )}

      {/* Saved Colleges */}
      {user.savedColleges?.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Saved Colleges ({user.savedColleges.length})</h2>
          <div className={styles.tagList}>
            {user.savedColleges.map(c => (
              <span key={c._id} className={styles.tag}>
                {c.name}{c.city ? ` · ${c.city}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
