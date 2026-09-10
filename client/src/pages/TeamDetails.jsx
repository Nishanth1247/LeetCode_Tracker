import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getTeamById,
  addTeamMember,
  removeTeamMember,
  createChallenge,
  deleteChallenge,
  getTeamAnalytics,
  getChallengeProgress,
} from '../services/api';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Challenge modal states
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [target, setTarget] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submittingChallenge, setSubmittingChallenge] = useState(false);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamRes, analyticsRes] = await Promise.all([
        getTeamById(id),
        getTeamAnalytics(),
      ]);

      if (teamRes.success) {
        setTeam(teamRes.data);
      }

      // Filter available connected members who are NOT in this team
      if (analyticsRes.success && analyticsRes.data.members) {
        const teamMemberIds = new Set((teamRes.data?.members || []).map((m) => m.id));
        const unassigned = analyticsRes.data.members.filter((m) => !teamMemberIds.has(m.id));
        setAvailableMembers(unassigned);
      }
    } catch (err) {
      console.error('Failed to load team details:', err);
      setError(err.response?.data?.message || 'Failed to load team details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    // Default dates for challenge form
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextWeek);
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await addTeamMember(id, selectedUserId);
      if (res.success) {
        setSuccess('Member added to team.');
        setSelectedUserId('');
        fetchTeamData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    }
  };

  const handleRemoveMember = async (userId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from this team?`)) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await removeTeamMember(id, userId);
      if (res.success) {
        setSuccess(`${memberName} removed from team.`);
        fetchTeamData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      setSubmittingChallenge(true);
      setError(null);
      setSuccess(null);

      const res = await createChallenge({
        teamId: id,
        title,
        description,
        difficulty,
        target,
        startDate,
        endDate,
      });

      if (res.success) {
        setSuccess('Challenge created for team!');
        setTitle('');
        setDescription('');
        setShowChallengeModal(false);
        fetchTeamData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create challenge.');
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const handleDeleteChallenge = async (challengeId, challengeTitle) => {
    if (!window.confirm(`Delete challenge "${challengeTitle}"?`)) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await deleteChallenge(challengeId);
      if (res.success) {
        setSuccess('Challenge deleted.');
        fetchTeamData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete challenge.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading team details...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="card empty-state">
        <h3>Team Not Found</h3>
        <button onClick={() => navigate('/admin/teams')} className="btn btn-primary">
          Back to Teams
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="welcome-subtitle">
            Created on {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowChallengeModal(true)}
            className="btn btn-primary"
            style={{ width: 'auto' }}
          >
            + Create Challenge
          </button>
          <Link to="/admin/teams" className="btn btn-secondary" style={{ width: 'auto', textDecoration: 'none' }}>
            ← Back to Teams
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create Challenge Modal / Form */}
      {showChallengeModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Create Team Challenge for {team.name}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateChallenge} className="connect-form">
              <div className="form-group">
                <label>Challenge Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Easy September Challenge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 20 Easy problems this week"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Difficulty *</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Problems *</label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submittingChallenge}>
                  {submittingChallenge ? 'Creating...' : 'Assign Challenge'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChallengeModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid: Members & Active Challenges */}
      <div className="dashboard-grid">
        {/* Members List */}
        <div className="card">
          <div className="card-header">
            <h3>Team Members ({team.members.length})</h3>
          </div>
          <div className="card-body">
            {/* Add Member Form */}
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem',
                  color: 'var(--text)',
                }}
              >
                <option value="">Select unassigned member...</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.username || 'No LeetCode'})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={!selectedUserId}>
                Add
              </button>
            </form>

            {team.members.length === 0 ? (
              <p className="not-connected-tag">No members assigned to this team yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>LeetCode</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((m) => (
                      <tr key={m.id}>
                        <td className="font-semibold">{m.name}</td>
                        <td>
                          {m.leetcodeUsername ? (
                            <span className="username-tag">@{m.leetcodeUsername}</span>
                          ) : (
                            <span className="not-connected-tag">Not connected</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleRemoveMember(m.id, m.name)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontWeight: 600,
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
        </div>

        {/* Team Challenges */}
        <div className="card">
          <div className="card-header">
            <h3>Team Challenges ({team.challenges.length})</h3>
          </div>
          <div className="card-body">
            {team.challenges.length === 0 ? (
              <p className="not-connected-tag">No challenges created for this team yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {team.challenges.map((c) => (
                  <AdminChallengeItem key={c.id} challenge={c} onDelete={handleDeleteChallenge} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminChallengeItem = ({ challenge, onDelete }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link
            to={`/admin/challenges/${challenge.id}`}
            style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
          >
            {challenge.title}
          </Link>
          {challenge.description && <p className="welcome-subtitle">{challenge.description}</p>}
        </div>
        <span
          className="status-badge"
          style={{
            backgroundColor:
              challenge.status === 'COMPLETED'
                ? 'rgba(16, 185, 129, 0.15)'
                : challenge.status === 'EXPIRED'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(37, 99, 235, 0.15)',
            color:
              challenge.status === 'COMPLETED'
                ? 'var(--status-easy)'
                : challenge.status === 'EXPIRED'
                ? 'var(--status-hard)'
                : 'var(--primary)',
          }}
        >
          {challenge.status}
        </span>
      </div>

      <div className="info-row" style={{ marginTop: '0.75rem' }}>
        <span className="info-label">Difficulty / Target</span>
        <span className="info-value">
          {challenge.difficulty} ({challenge.target} problems)
        </span>
      </div>

      <div className="info-row">
        <span className="info-label">Timeline</span>
        <span className="info-value">
          {new Date(challenge.startDate).toLocaleDateString()} – {new Date(challenge.endDate).toLocaleDateString()}
        </span>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to={`/admin/challenges/${challenge.id}`}
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
        >
          View Full Progress →
        </Link>
        <button
          onClick={() => onDelete(challenge.id, challenge.title)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default TeamDetails;
