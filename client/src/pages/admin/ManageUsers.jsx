import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import styles from './ManageUsers.module.css';

const { getAllUsers, toggleActiveStatus } = userService;

const ROLES = ['student', 'admin', 'counsellor', 'moderator', 'institution_rep', 'partner'];

export default function ManageUsers() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ role: '', isActive: '', search: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => getAllUsers(filters),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId) => toggleActiveStatus(userId),
    onSuccess: () => qc.invalidateQueries(['admin-users']),
  });

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Users</h1>
          <p className={styles.subtitle}>{total} total users</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          className={styles.searchInput}
        />
        <select
          value={filters.role}
          onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
          className={styles.filterSelect}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={filters.isActive}
          onChange={e => setFilters(f => ({ ...f, isActive: e.target.value, page: 1 }))}
          className={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className={styles.empty}>Loading users...</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>No users found.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleBadgeAdmin : ''}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={user.emailVerified ? styles.verifiedYes : styles.verifiedNo}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleMutation.mutate(user._id)}
                        className={`${styles.statusBtn} ${user.isActive ? styles.statusActive : styles.statusInactive}`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        <Link to={`/admin/users/${user._id}`} className={styles.editBtn}>
                          View / Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={filters.page === 1}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            >
              ← Prev
            </button>
            <span className={styles.pageInfo}>Page {filters.page}</span>
            <button
              className={styles.pageBtn}
              disabled={users.length < 20}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
