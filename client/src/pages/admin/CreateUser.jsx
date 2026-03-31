import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCreateUser } from '../../hooks/queries';
import styles from './AdminUserDetail.module.css'; // reuse same CSS

const MANAGED_ROLES = ['partner', 'counsellor', 'moderator', 'institution_rep', 'admin'];

export default function CreateUser() {
  const navigate = useNavigate();
  const { mutate: createUser, isPending } = useAdminCreateUser();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'partner', password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser(form, { onSuccess: () => navigate('/admin/users') });
  };

  return (
    <div className={styles.page}>
      <button className={styles.backLink} onClick={() => navigate('/admin/users')}>
        ← Back to Users
      </button>

      <div className={styles.card}>
        <div className={styles.userHeader} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '1.5rem' }}>
          <div>
            <h1 className={styles.userName}>Create New Account</h1>
            <p className={styles.userEmail}>Admin-created accounts are email-verified by default</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Account Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Full Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Email *</label>
              <input
                type="email"
                required
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
              <label>Role *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {MANAGED_ROLES.map(r => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>Temporary Password (leave blank to auto-generate)</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Auto-generated if left blank"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={isPending} className={styles.submitBtn}>
              {isPending ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
