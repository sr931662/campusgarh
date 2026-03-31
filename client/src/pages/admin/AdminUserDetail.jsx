import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, adminUpdateUser, assignRole } from '../../services/userService';

const ROLES = ['student', 'admin', 'counsellor', 'moderator', 'institution_rep', 'partner'];

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
  });

  const user = data?.data?.user;

  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  // initialize form once user loads
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

  if (isLoading) return <div className="p-8 text-gray-500">Loading user...</div>;
  if (!user) return <div className="p-8 text-red-500">User not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/admin/users')}
        className="text-sm text-blue-600 hover:underline mb-4 block"
      >
        ← Back to Users
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">
              Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}
              {user.lastLogin && ` · Last login: ${new Date(user.lastLogin).toLocaleDateString('en-IN')}`}
            </p>
          </div>
        </div>

        {form && (
          <form
            onSubmit={e => {
              e.preventDefault();
              updateMutation.mutate(form);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">Active Account</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.emailVerified}
                    onChange={e => setForm(f => ({ ...f, emailVerified: e.target.checked }))}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm text-gray-700">Email Verified</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className="text-green-600 text-sm">Saved successfully!</span>}
            </div>
          </form>
        )}
      </div>

      {/* Read-only info */}
      {user.academicBackground?.qualification && (
        <div className="bg-white rounded-xl shadow p-6 mt-4">
          <h2 className="font-semibold text-gray-700 mb-3">Academic Background</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>Qualification: <strong>{user.academicBackground.qualification}</strong></div>
            <div>Stream: <strong>{user.academicBackground.stream || '—'}</strong></div>
            <div>Institution: <strong>{user.academicBackground.institution || '—'}</strong></div>
            <div>Percentage: <strong>{user.academicBackground.percentage || '—'}</strong></div>
          </div>
        </div>
      )}

      {user.savedColleges?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mt-4">
          <h2 className="font-semibold text-gray-700 mb-3">Saved Colleges ({user.savedColleges.length})</h2>
          <div className="flex flex-wrap gap-2">
            {user.savedColleges.map(c => (
              <span key={c._id} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                {c.name} {c.city ? `· ${c.city}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
