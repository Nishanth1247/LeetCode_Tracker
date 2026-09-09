import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeams, createTeam, deleteTeam, getTeamAnalytics } from '../services/api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [teamsRes, analyticsRes] = await Promise.all([
        getAllTeams(),
        getTeamAnalytics(),
      ]);

      if (teamsRes.success) {
        setTeams(teamsRes.data || []);
      }

      // Filter unassigned MEMBER users
      if (analyticsRes.success && analyticsRes.data.members) {
        // Members list from team analytics
        // Let's also fetch total members list or compute unassigned
        // We will fetch unassigned members
        setUnassignedMembers(analyticsRes.data.members);
      }
    } catch (err) {
      console.error('Failed to load teams data:', err);
      setError(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await createTeam({
        name: teamName.trim(),
        memberIds: selectedMembers,
      });

      if (res.success) {
        setSuccess('Team created successfully!');
        setTeamName('');
        setSelectedMembers([]);
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId, name) => {
    if (!window.confirm(`Are you sure you want to delete team "${name}"? This will also remove its challenge assignments.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const res = await deleteTeam(teamId);
      if (res.success) {
        setSuccess(`Team "${name}" deleted.`);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team.');
    }
  };

  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Teams Management</h1>
          <p className="welcome-subtitle">Create and manage member teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ width: 'auto' }}
        >
          + Create New Team
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create Team Modal / Card */}
      {showCreateModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Create Team</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateTeam} className="connect-form">
              <div className="form-group">
                <label>Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Team Alpha"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Initial Members (Optional)</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                  {unassignedMembers.length === 0 ? (
                    <p className="not-connected-tag">No connected members available.</p>
                  ) : (
                    unassignedMembers.map((m) => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(m.id)}
                          onChange={() => toggleMemberSelection(m.id)}
                        />
                        <span>{m.name} ({m.username || 'No LeetCode'})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="card empty-state">
          <h3>No Teams Created Yet</h3>
          <p>Click "+ Create New Team" to group members together.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {teams.map((t) => (
            <div key={t.id} className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>⚡ {t.name}</h3>
                <span className="user-profile-badge">{t.memberCount} Members</span>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="info-label">Active Challenges</span>
                  <span className="info-value">{t.activeChallengeCount}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created</span>
                  <span className="info-value">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-footer" style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/admin/teams/${t.id}`} className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  Manage Team & Challenges
                </Link>
                <button
                  onClick={() => handleDeleteTeam(t.id, t.name)}
                  className="btn btn-secondary"
                  style={{ width: 'auto', color: '#ef4444' }}
                  title="Delete Team"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
