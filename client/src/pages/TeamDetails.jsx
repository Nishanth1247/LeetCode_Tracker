import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getTeamById,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  createChallenge,
  deleteChallenge,
  getTeamAnalytics,
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

  // Leader state
  const [updatingLeader, setUpdatingLeader] = useState(false);

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
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextWeek);
  }, [id]);

  const handleLeaderChange = async (newLeaderId) => {
    try {
      setUpdatingLeader(true);
      setError(null);
      setSuccess(null);

      const res = await updateTeam(id, {
        leaderId: newLeaderId ? parseInt(newLeaderId, 10) : null,
      });

      if (res.success) {
        setSuccess(newLeaderId ? 'Team Leader assigned.' : 'Team Leader removed.');
        fetchTeamData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update Team Leader.');
    } finally {
      setUpdatingLeader(false);
    }
  };

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
        setSuccess('Team Task created successfully!');
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
            {team.leaderName && ` • Leader: ${team.leaderName}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowChallengeModal(true)}
            className="btn btn-primary"
            style={{ width: 'auto' }}
          >
            + Create Team Task
          </button>
          <Link to="/admin/teams" className="btn btn-secondary" style={{ width: 'auto', textDecoration: 'none' }}>
            ← Back to Teams
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create Team Task Modal / Form */}
      {showChallengeModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Create Team Task for {team.name}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateChallenge} className="connect-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Team Alpha September Goal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 50 problems as a team"
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
                  {submittingChallenge ? 'Creating...' : 'Assign Team Task'}
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
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                Add Member
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
                      <th>Role / Status</th>
                      <th>LeetCode</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.members.map((m) => (
                      <tr key={m.id}>
                        <td className="font-semibold">{m.name}</td>
                        <td>
                          {m.isLeader ? (
                            <span className="status-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
                              Team Leader
                            </span>
                          ) : (
                            <button
                              onClick={() => handleLeaderChange(m.id)}
                              disabled={updatingLeader}
                              style={{
                                background: 'none',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                              }}
                            >
                              Make Leader
                            </button>
                          )}
                        </td>
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

        {/* Team Tasks & Individual Assignments */}
        <div className="card">
          <div className="card-header">
            <h3>Tasks & Assignments ({team.challenges.length})</h3>
          </div>
          <div className="card-body">
            {team.challenges.length === 0 ? (
              <p className="not-connected-tag">No tasks or assignments created for this team yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {team.challenges.map((c) => (
                  <AdminChallengeItem
                    key={c.id}
                    challenge={c}
                    teamMembers={team.members}
                    onDelete={handleDeleteChallenge}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminChallengeItem = ({ challenge, teamMembers, onDelete }) => {
  const isIndividual = challenge.assignmentType === 'INDIVIDUAL';
  const assignedMember = isIndividual
    ? teamMembers.find((m) => m.id === challenge.assignedTo)
    : null;

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="status-badge"
              style={{
                backgroundColor: isIndividual ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: isIndividual ? '#9333ea' : '#2563eb',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
              }}
            >
              {isIndividual ? 'INDIVIDUAL TASK' : 'TEAM TASK'}
            </span>
            <Link
              to={`/admin/challenges/${challenge.id}`}
              style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
            >
              {challenge.title}
            </Link>
          </div>
          {isIndividual && assignedMember && (
            <p className="welcome-subtitle" style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
              Assigned to: <strong>{assignedMember.name}</strong>
            </p>
          )}
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
