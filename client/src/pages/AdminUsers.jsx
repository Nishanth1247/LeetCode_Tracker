import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAllTeams, updateAdminUser, deleteAdminUser } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLeetCode, setEditLeetCode] = useState('');
  const [editTeamId, setEditTeamId] = useState('');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete Modal State
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsersAndTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, teamsRes] = await Promise.all([
        getAdminUsers(),
        getAllTeams().catch(() => null),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.data || []);
      }
      if (teamsRes && teamsRes.success) {
        setTeams(teamsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
      setError(err.response?.data?.message || 'Failed to load member accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndTeams();
  }, []);

  // Filtered users calculation
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.leetcodeUsername && u.leetcodeUsername.toLowerCase().includes(searchLower));

    const matchesTeam =
      selectedTeamFilter === 'ALL' ||
      (selectedTeamFilter === 'UNASSIGNED' && !u.teamId) ||
      (u.teamId && String(u.teamId) === selectedTeamFilter);

    return matchesSearch && matchesTeam;
  });

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditLeetCode(user.leetcodeUsername || '');
    setEditTeamId(user.teamId ? String(user.teamId) : 'none');
    setModalError(null);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdating(true);
      setModalError(null);
      setError(null);
      setSuccess(null);

      const res = await updateAdminUser(editingUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        leetcodeUsername: editLeetCode.trim(),
        teamId: editTeamId === 'none' ? null : editTeamId,
      });

      if (res.success) {
        setSuccess(`Updated member profile for '${editName.trim()}'.`);
        setEditingUser(null);
        fetchUsersAndTeams();
      }
    } catch (err) {
      console.error('Update user error:', err);
      setModalError(err.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (user) => {
    setDeletingUser(user);
  };

  // Confirm Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const res = await deleteAdminUser(deletingUser.id);
      if (res.success) {
        setSuccess(res.message || `Member '${deletingUser.name}' removed successfully.`);
        setDeletingUser(null);
        fetchUsersAndTeams();
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.message || 'Failed to remove member.');
      setDeletingUser(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading member accounts...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="welcome-subtitle">View, edit, and remove member accounts</p>
        </div>
        <div className="stat-summary-badge">
          <span>Registered Members:</span>
          <strong>{users.length}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Search & Team Filter Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 250px', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search by Name, Email, or LeetCode username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.8rem',
              color: 'var(--text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 500 }}>
            Filter Team:
          </label>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              color: 'var(--text)',
              fontSize: '0.88rem',
            }}
          >
            <option value="ALL">All Teams</option>
            <option value="UNASSIGNED">Unassigned</option>
            {teams.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Edit Member Profile</h3>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              {modalError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{modalError}</div>}
              <form onSubmit={handleSaveEdit} className="connect-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>LeetCode Username</label>
                  <input
                    type="text"
                    placeholder="e.g. arun123"
                    value={editLeetCode}
                    onChange={(e) => setEditLeetCode(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'block' }}>
                    Changing username validates profile with LeetCode. Statistics will update on next sync batch.
                  </span>
                </div>

                <div className="form-group">
                  <label>Team Assignment</label>
                  <select
                    value={editTeamId}
                    onChange={(e) => setEditTeamId(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="none">No Team (Unassigned)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    {updating ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="btn btn-secondary"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {deletingUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="card-header">
              <h3 style={{ color: '#ef4444' }}>Remove {deletingUser.name}?</h3>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
                Are you sure you want to remove <strong>{deletingUser.name}</strong> ({deletingUser.email})?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                This will remove the member account and associated team membership/data. Teams and challenges will remain intact. This action cannot be easily undone.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleConfirmDelete}
                  className="btn"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
                  disabled={deleting}
                >
                  {deleting ? 'Removing...' : 'Remove User'}
                </button>
                <button
                  onClick={() => setDeletingUser(null)}
                  className="btn btn-secondary"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table / Cards Container */}
      {filteredUsers.length === 0 ? (
        <div className="card empty-state">
          <h3>No Members Found</h3>
          <p>
            {users.length === 0
              ? 'No member accounts registered yet.'
              : 'No member accounts match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Team</th>
                  <th>LeetCode</th>
                  <th>Solved</th>
                  <th>Last Synced</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold">{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      {m.teamName ? (
                        <span className="user-profile-badge" style={{ fontSize: '0.8rem' }}>
                          {m.teamName}
                        </span>
                      ) : (
                        <span className="not-connected-tag">No Team</span>
                      )}
                    </td>
                    <td>
                      {m.leetcodeUsername ? (
                        <span className="username-tag">@{m.leetcodeUsername}</span>
                      ) : (
                        <span className="not-connected-tag">Not connected</span>
                      )}
                    </td>
                    <td className="font-semibold">
                      {m.leetcodeUsername ? (
                        <span className="highlight-total">{m.leetcodeTotalSolved}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="sync-time">{formatDateTime(m.leetcodeLastSynced)}</td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--primary)',
                            padding: '0.3rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(m)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#ef4444',
                            padding: '0.3rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
