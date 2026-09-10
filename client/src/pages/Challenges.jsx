import React, { useState, useEffect } from 'react';
import {
  getAllChallenges,
  getAllTeams,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from '../services/api';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const [teamId, setTeamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [target, setTarget] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [challengesRes, teamsRes] = await Promise.all([
        getAllChallenges(),
        getAllTeams(),
      ]);

      if (challengesRes.success) setChallenges(challengesRes.data || []);
      if (teamsRes.success) setTeams(teamsRes.data || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.response?.data?.message || 'Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextWeek);
  }, []);

  const openCreateModal = () => {
    setEditingChallenge(null);
    setTitle('');
    setDescription('');
    setDifficulty('EASY');
    setTarget(10);
    if (teams.length > 0) setTeamId(teams[0].id);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingChallenge(c);
    setTitle(c.title);
    setDescription(c.description || '');
    setDifficulty(c.difficulty);
    setTarget(c.target);
    setTeamId(c.teamId);
    setStartDate(new Date(c.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(c.endDate).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingChallenge) {
        // Edit mode (enforces restriction rule in backend if started)
        const res = await updateChallenge(editingChallenge.id, {
          title,
          description,
          difficulty,
          target,
          startDate,
          endDate,
        });

        if (res.success) {
          setSuccess('Challenge updated successfully.');
          setShowModal(false);
          fetchData();
        }
      } else {
        // Create mode
        const res = await createChallenge({
          teamId,
          title,
          description,
          difficulty,
          target,
          startDate,
          endDate,
        });

        if (res.success) {
          setSuccess('Challenge created successfully.');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete challenge "${title}"?`)) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await deleteChallenge(id);
      if (res.success) {
        setSuccess('Challenge deleted.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete challenge.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading challenges...</p>
      </div>
    );
  }

  // Check if challenge has started
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Team Challenges</h1>
          <p className="welcome-subtitle">Manage coding goals and target timelines across teams</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{ width: 'auto' }}
          disabled={teams.length === 0}
        >
          + Create Challenge
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Challenge Form Modal */}
      {showModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>{editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="connect-form">
              {!editingChallenge && (
                <div className="form-group">
                  <label>Assign to Team *</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem',
                      color: 'var(--text)',
                    }}
                    required
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mixed September Sprint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 30 problems together"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>
                    Difficulty *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
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
                  <label>
                    Start Date *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challenges List Table */}
      {challenges.length === 0 ? (
        <div className="card empty-state">
          <h3>No Challenges Created Yet</h3>
          <p>Assign your first challenge to a team using the button above.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Target</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((c) => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.teamName}</td>
                    <td>
                      <Link to={`/admin/challenges/${c.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        {c.title}
                      </Link>
                    </td>
                    <td>
                      <span className="username-tag">{c.difficulty}</span>
                    </td>
                    <td className="font-semibold">{c.target}</td>
                    <td>{new Date(c.startDate).toLocaleDateString()}</td>
                    <td>{new Date(c.endDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            c.status === 'COMPLETED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : c.status === 'EXPIRED'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(37, 99, 235, 0.15)',
                          color:
                            c.status === 'COMPLETED'
                              ? 'var(--status-easy)'
                              : c.status === 'EXPIRED'
                              ? 'var(--status-hard)'
                              : 'var(--primary)',
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Link
                          to={`/admin/challenges/${c.id}`}
                          style={{
                            color: 'var(--primary)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                          }}
                        >
                          View Progress
                        </Link>
                        <button
                          onClick={() => openEditModal(c)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Delete
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

export default Challenges;
