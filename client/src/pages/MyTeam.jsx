import React, { useState, useEffect } from 'react';
import { getMyTeam, getChallengeProgress, createIndividualChallenge, deleteIndividualChallenge } from '../services/api';

const MyTeam = () => {
  const [team, setTeam] = useState(null);
  const [activeChallengeData, setActiveChallengeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState(null);

  // Individual Task Creation Modal (for Team Leaders)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [target, setTarget] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [submittingTask, setSubmittingTask] = useState(false);

  const fetchTeamAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const teamRes = await getMyTeam();

      if (teamRes.success && teamRes.data) {
        setTeam(teamRes.data);

        // Fetch progress for all team challenges
        const challenges = teamRes.data.challenges || [];
        const progressPromises = challenges.map((c) =>
          getChallengeProgress(c.id).catch(() => null)
        );

        const results = await Promise.all(progressPromises);
        const validResults = results
          .filter((r) => r && r.success)
          .map((r) => r.data);

        setActiveChallengeData(validResults);
      } else {
        setTeam(null);
      }
    } catch (err) {
      console.error('Failed to load my team data:', err);
      setError(err.response?.data?.message || 'Failed to load team details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndProgress();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextWeek);
  }, []);

  const handleToggleAssignee = (memberId) => {
    if (selectedAssignees.includes(memberId)) {
      setSelectedAssignees(selectedAssignees.filter((id) => id !== memberId));
    } else {
      setSelectedAssignees([...selectedAssignees, memberId]);
    }
  };

  const handleSelectAllAssignees = () => {
    if (!team || !team.members) return;
    if (selectedAssignees.length === team.members.length) {
      setSelectedAssignees([]);
    } else {
      setSelectedAssignees(team.members.map((m) => m.id));
    }
  };

  const handleCreateIndividualTask = async (e) => {
    e.preventDefault();
    if (selectedAssignees.length === 0) {
      setError('Please select at least one team member to assign.');
      return;
    }

    try {
      setSubmittingTask(true);
      setError(null);
      setSuccess(null);

      const res = await createIndividualChallenge({
        assignedTo: selectedAssignees,
        title,
        description,
        difficulty,
        target,
        startDate,
        endDate,
      });

      if (res.success) {
        setSuccess('Individual task assignment(s) created successfully!');
        setTitle('');
        setDescription('');
        setSelectedAssignees([]);
        setShowTaskModal(false);
        fetchTeamAndProgress();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign individual task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete task assignment "${taskTitle}"?`)) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await deleteIndividualChallenge(taskId);
      if (res.success) {
        setSuccess('Task assignment deleted.');
        fetchTeamAndProgress();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your team dashboard...</p>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  // Not assigned state
  if (!team) {
    return (
      <div className="dashboard-container">
        <div className="card empty-state" style={{ padding: '3rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>No Team Assigned</h2>
          <p className="welcome-subtitle">You are not assigned to a team yet.</p>
          <p className="not-connected-tag" style={{ marginTop: '0.5rem' }}>
            Please reach out to your administrator to be added to a team.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.isLeader && (
              <span className="status-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
                Team Leader
              </span>
            )}
          </div>
          <p className="welcome-subtitle">
            {team.isLeader
              ? 'You are Team Leader for this team. You can assign individual tasks.'
              : `Team Leader: ${team.leaderName ? team.leaderName : 'Unassigned'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {team.isLeader && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary"
              style={{ width: 'auto' }}
            >
              + Assign Member Task
            </button>
          )}
          <div className="stat-summary-badge">
            <span>Members:</span>
            <strong>{team.members.length} Members</strong>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Task Creation Modal for Team Leaders */}
      {showTaskModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Assign Individual Task to Team Members</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateIndividualTask} className="connect-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Solve Array Problems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Focus on easy sliding window problems"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Assign To *</label>
                  <button
                    type="button"
                    onClick={handleSelectAllAssignees}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {selectedAssignees.length === team.members.length ? 'Deselect All' : 'Select All Members'}
                  </button>
                </div>
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
                  {team.members.map((m) => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(m.id)}
                        onChange={() => handleToggleAssignee(m.id)}
                      />
                      <span>{m.name} {m.isLeader && '(You)'}</span>
                    </label>
                  ))}
                </div>
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
                <button type="submit" className="btn btn-primary" disabled={submittingTask}>
                  {submittingTask ? 'Creating...' : `Assign Task to ${selectedAssignees.length} Member(s)`}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Roster & Tasks */}
      <div className="dashboard-grid">
        {/* Roster Card */}
        <div className="card">
          <div className="card-header">
            <h3>Team Members ({team.members.length})</h3>
          </div>
          <div className="card-body">
            <ul className="activity-list">
              {team.members.map((m, idx) => (
                <li key={m.id} className="activity-item">
                  <div className="activity-item-main">
                    <span className="activity-index">#{idx + 1}</span>
                    <span className="activity-title">
                      {m.name} {m.isLeader && '(Leader)'}
                    </span>
                  </div>
                  {m.leetcodeUsername ? (
                    <span className="username-tag">@{m.leetcodeUsername}</span>
                  ) : (
                    <span className="not-connected-tag">Not connected</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tasks & Progress Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeChallengeData.length === 0 ? (
            <div className="card empty-state">
              <h3>No Active Tasks</h3>
              <p>Your team currently has no tasks or individual assignments.</p>
            </div>
          ) : (
            activeChallengeData.map((data) => {
              const { challenge, progress, difficultyBreakdown, status, membersProgress, problems } = data;
              const isExpanded = expandedChallengeId === challenge.id;
              const isIndividual = challenge.assignmentType === 'INDIVIDUAL';
              const assignedMember = isIndividual
                ? team.members.find((m) => m.id === challenge.assignedTo)
                : null;

              const endDate = new Date(challenge.endDate);
              const now = new Date();
              const diffTime = endDate - now;
              const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

              return (
                <div key={challenge.id} className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
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
                        <h3>{challenge.title}</h3>
                      </div>
                      {isIndividual && (
                        <p className="welcome-subtitle" style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
                          Assigned To: <span style={{ color: 'var(--text)' }}>{assignedMember ? assignedMember.name : (challenge.assignedToName || 'Unassigned')}</span>
                        </p>
                      )}
                      {challenge.description && (
                        <p className="welcome-subtitle">{challenge.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            status === 'COMPLETED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : status === 'EXPIRED'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(37, 99, 235, 0.15)',
                          color:
                            status === 'COMPLETED'
                              ? 'var(--status-easy)'
                              : status === 'EXPIRED'
                              ? 'var(--status-hard)'
                              : 'var(--primary)',
                        }}
                      >
                        {status}
                      </span>
                      {team.isLeader && isIndividual && (
                        <button
                          onClick={() => handleDeleteTask(challenge.id, challenge.title)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                          title="Delete Individual Task"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                      <div>
                        Difficulty: <strong style={{ color: 'var(--text)' }}>{challenge.difficulty}</strong>
                      </div>
                      <div>
                        Target: <strong style={{ color: 'var(--text)' }}>{challenge.target}</strong>
                      </div>
                      <div>
                        Timeline: <span style={{ color: 'var(--text)' }}>{new Date(challenge.startDate).toLocaleDateString()} – {new Date(challenge.endDate).toLocaleDateString()}</span>
                      </div>
                      {status === 'ACTIVE' && (
                        <div>
                          Days Left: <strong style={{ color: 'var(--primary)' }}>{daysRemaining} day{daysRemaining === 1 ? '' : 's'}</strong>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <span>{isIndividual ? 'Task Progress' : 'Total Team Progress'}</span>
                        <span>
                          {progress.solved} / {progress.target} solved ({progress.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: 'var(--border)',
                          borderRadius: '5px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${progress.percentage}%`,
                            height: '100%',
                            backgroundColor:
                              status === 'COMPLETED'
                                ? 'var(--status-easy)'
                                : 'var(--primary)',
                            transition: 'width 0.3s ease',
                          }}
                        ></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        <span>Remaining: {progress.remaining}</span>
                        {difficultyBreakdown && (
                          <span>
                            Breakdown: <span className="text-easy">{difficultyBreakdown.easy} Easy</span> | <span className="text-medium">{difficultyBreakdown.medium} Med</span> | <span className="text-hard">{difficultyBreakdown.hard} Hard</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Breakdown — Visible ONLY to Team Leaders & Admin */}
                    {team.isLeader ? (
                      <div style={{ marginTop: '1.25rem' }}>
                        <h4 className="activity-list-title">
                          {isIndividual ? 'Assigned Member Progress' : 'Member Progress Breakdown'}
                        </h4>
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Member</th>
                                <th>Solved</th>
                                <th>Remaining</th>
                                <th>Progress</th>
                              </tr>
                            </thead>
                            <tbody>
                              {membersProgress.map((m) => (
                                <tr key={m.userId}>
                                  <td className="font-semibold">{m.name}</td>
                                  <td>{m.solved}</td>
                                  <td>{m.remaining}</td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${m.percentage}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                                      </div>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{m.percentage}%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* Normal Member View: Display strictly personal progress details */
                      membersProgress.length > 0 && (
                        <div style={{ marginTop: '1.25rem', backgroundColor: 'var(--surface-hover)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem' }}>My Progress Details</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)' }}>
                            <span>Solved: <strong style={{ color: 'var(--text)' }}>{membersProgress[0].solved}</strong></span>
                            <span>Remaining: <strong style={{ color: 'var(--text)' }}>{membersProgress[0].remaining}</strong></span>
                            <span>My Target: <strong style={{ color: 'var(--text)' }}>{membersProgress[0].target}</strong></span>
                            <span>My Completion: <strong style={{ color: 'var(--primary)' }}>{membersProgress[0].percentage}%</strong></span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Toggle View Contributed Problems (Leader / Admin view all, Member views own) */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', width: 'auto' }}
                        onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                      >
                        {isExpanded
                          ? 'Hide Contributed Problems ▲'
                          : team.isLeader
                          ? `View Contributed Problems (${problems.length}) ▼`
                          : `View My Solved Problems (${problems.length}) ▼`}
                      </button>

                      {isExpanded && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                            {team.isLeader ? `Contributed Problems (${problems.length})` : `My Solved Problems (${problems.length})`}
                          </h4>
                          {problems.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              No tracked submissions for this task yet.
                            </p>
                          ) : (
                            <div className="table-responsive">
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    {team.isLeader && <th>Member</th>}
                                    <th>Title</th>
                                    <th>Difficulty</th>
                                    <th>Language</th>
                                    <th>Solved Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {problems.map((p, idx) => (
                                    <tr key={idx}>
                                      {team.isLeader && <td>{p.userName}</td>}
                                      <td className="font-semibold">{p.title}</td>
                                      <td>
                                        <span
                                          className="status-badge"
                                          style={{
                                            backgroundColor:
                                              p.difficulty === 'EASY'
                                                ? 'rgba(16, 185, 129, 0.15)'
                                                : p.difficulty === 'MEDIUM'
                                                ? 'rgba(245, 158, 11, 0.15)'
                                                : p.difficulty === 'HARD'
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : 'rgba(100, 116, 139, 0.15)',
                                            color:
                                              p.difficulty === 'EASY'
                                                ? 'var(--status-easy)'
                                                : p.difficulty === 'MEDIUM'
                                                ? 'var(--status-medium)'
                                                : p.difficulty === 'HARD'
                                                ? 'var(--status-hard)'
                                                : 'var(--muted)',
                                          }}
                                        >
                                          {p.difficulty}
                                        </span>
                                      </td>
                                      <td>{p.language}</td>
                                      <td>{new Date(p.solvedAt).toLocaleDateString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
