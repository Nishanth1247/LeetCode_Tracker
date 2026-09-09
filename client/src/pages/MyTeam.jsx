import React, { useState, useEffect } from 'react';
import { getMyTeam, getChallengeProgress } from '../services/api';

const MyTeam = () => {
  const [team, setTeam] = useState(null);
  const [activeChallengeData, setActiveChallengeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChallengeId, setExpandedChallengeId] = useState(null);

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
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your team dashboard...</p>
      </div>
    );
  }

  if (error) {
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
          <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</span>
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
          <h1 className="text-2xl font-bold"> {team.name}</h1>
          <p className="welcome-subtitle">Your Team Dashboard & Challenges</p>
        </div>
        <div className="stat-summary-badge">
          <span>Roster:</span>
          <strong>{team.members.length} Members</strong>
        </div>
      </div>

      {/* Submission Tracking Notice */}
      <div
        style={{
          backgroundColor: 'var(--primary-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          fontSize: '0.82rem',
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>ℹ️</span>
        <span>
          <strong>Submission-Based Progress:</strong> Progress calculated from tracked LeetCode submission records within challenge timelines.
        </span>
      </div>

      {/* Main Grid: Roster & Challenges */}
      <div className="dashboard-grid">
        {/* Roster Card */}
        <div className="card">
          <div className="card-header">
            <h3>Team Roster ({team.members.length})</h3>
          </div>
          <div className="card-body">
            <ul className="activity-list">
              {team.members.map((m, idx) => (
                <li key={m.id} className="activity-item">
                  <div className="activity-item-main">
                    <span className="activity-index">#{idx + 1}</span>
                    <span className="activity-title">{m.name}</span>
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

        {/* Challenges & Progress Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeChallengeData.length === 0 ? (
            <div className="card empty-state">
              <h3>No Active Challenges</h3>
              <p>Your team currently has no coding challenges assigned.</p>
            </div>
          ) : (
            activeChallengeData.map((data) => {
              const { challenge, progress, difficultyBreakdown, status, membersProgress, problems } = data;
              const isExpanded = expandedChallengeId === challenge.id;

              // Calculate days remaining
              const endDate = new Date(challenge.endDate);
              const now = new Date();
              const diffTime = endDate - now;
              const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

              return (
                <div key={challenge.id} className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3>{challenge.title}</h3>
                      {challenge.description && (
                        <p className="welcome-subtitle">{challenge.description}</p>
                      )}
                    </div>
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
                  </div>

                  <div className="card-body">
                    {/* Difficulty & Timeline Info */}
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

                    {/* Team Aggregate Progress Bar */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.35rem' }}>
                        <span>Total Team Progress</span>
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

                    {/* Member Breakdown */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <h4 className="activity-list-title">Member Progress</h4>
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

                    {/* Toggle View Contributed Problems */}
                    <div style={{ marginTop: '1.25rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.85rem', width: 'auto' }}
                        onClick={() => setExpandedChallengeId(isExpanded ? null : challenge.id)}
                      >
                        {isExpanded ? 'Hide Contributed Problems ▲' : `View Contributed Problems (${problems.length}) ▼`}
                      </button>

                      {isExpanded && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Contributed Problems ({problems.length})</h4>
                          {problems.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                              No tracked submissions for this challenge yet.
                            </p>
                          ) : (
                            <div className="table-responsive">
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>Member</th>
                                    <th>Title</th>
                                    <th>Difficulty</th>
                                    <th>Language</th>
                                    <th>Solved Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {problems.map((p, idx) => (
                                    <tr key={idx}>
                                      <td>{p.userName}</td>
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
