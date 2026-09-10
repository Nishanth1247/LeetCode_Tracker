import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChallengeProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChallengeProgressDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getChallengeProgress(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load challenge details:', err);
      setError(err.response?.data?.message || 'Failed to load challenge progress details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading challenge progress details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">{error || 'Challenge data not found.'}</div>
        <button onClick={() => navigate(isAdmin ? '/admin/challenges' : '/my-team')} className="btn btn-secondary" style={{ width: 'auto' }}>
          ← Back to Challenges
        </button>
      </div>
    );
  }

  const { challenge, progress, difficultyBreakdown, status, membersProgress, problems } = data;

  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const diffTime = endDate - now;
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          {challenge.description && <p className="welcome-subtitle">{challenge.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
          <button
            onClick={() => navigate(isAdmin ? '/admin/challenges' : '/my-team')}
            className="btn btn-secondary"
            style={{ width: 'auto' }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Grid: Challenge Specs & Aggregate Progress */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Specs Card */}
        <div className="card">
          <div className="card-header">
            <h3>Challenge Overview</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Assigned Team</span>
              <span className="info-value font-semibold">{challenge.teamName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Difficulty</span>
              <span className="info-value">
                <span className="username-tag">{challenge.difficulty}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Target Problems</span>
              <span className="info-value font-semibold">{challenge.target}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Start Date</span>
              <span className="info-value">{new Date(challenge.startDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">End Date</span>
              <span className="info-value">{new Date(challenge.endDate).toLocaleDateString()}</span>
            </div>
            {status === 'ACTIVE' && (
              <div className="info-row">
                <span className="info-label">Time Remaining</span>
                <span className="info-value" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {daysRemaining} day{daysRemaining === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Overall Team Progress Card */}
        <div className="card">
          <div className="card-header">
            <h3>Team Progress</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <span>Overall Completion</span>
              <span>
                {progress.solved} / {progress.target} ({progress.percentage}%)
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '14px',
                backgroundColor: 'var(--border)',
                borderRadius: '7px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: `${progress.percentage}%`,
                  height: '100%',
                  backgroundColor: status === 'COMPLETED' ? 'var(--status-easy)' : 'var(--primary)',
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>

            <div className="stats-grid" style={{ padding: 0 }}>
              <div className="stat-box">
                <span className="stat-title">Remaining</span>
                <span className="stat-number highlight-total">{progress.remaining}</span>
              </div>
              {challenge.difficulty === 'MIXED' ? (
                <>
                  <div className="stat-box">
                    <span className="stat-title">Easy Solved</span>
                    <span className="stat-number text-easy">{difficultyBreakdown.easy}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Medium Solved</span>
                    <span className="stat-number text-medium">{difficultyBreakdown.medium}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Hard Solved</span>
                    <span className="stat-number text-hard">{difficultyBreakdown.hard}</span>
                  </div>
                </>
              ) : (
                <div className="stat-box">
                  <span className="stat-title">Solved Target</span>
                  <span className="stat-number text-easy">{progress.solved}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Member Progress Table Section */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Member Progress ({membersProgress.length})</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Solved</th>
                <th>Target</th>
                <th>Remaining</th>
                <th>Progress</th>
                <th>Contributed Problems</th>
              </tr>
            </thead>
            <tbody>
              {membersProgress.map((m) => {
                const isExpanded = expandedUserId === m.userId;
                const memberProbs = m.problems || [];

                return (
                  <React.Fragment key={m.userId}>
                    <tr>
                      <td className="font-semibold">{m.name}</td>
                      <td className="font-semibold">{m.solved}</td>
                      <td>{m.target}</td>
                      <td>{m.remaining}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${m.percentage}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                          onClick={() => setExpandedUserId(isExpanded ? null : m.userId)}
                        >
                          {isExpanded ? 'Hide Problems ▲' : `View (${memberProbs.length}) ▼`}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" style={{ backgroundColor: 'var(--primary-subtle)', padding: '1rem' }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Problems Solved by {m.name} for this Challenge ({memberProbs.length})
                          </h4>
                          {memberProbs.length === 0 ? (
                            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                              No tracked submissions for this challenge yet.
                            </p>
                          ) : (
                            <div className="table-responsive">
                              <table className="data-table" style={{ fontSize: '0.82rem' }}>
                                <thead>
                                  <tr>
                                    <th>Problem Title</th>
                                    <th>Slug</th>
                                    <th>Difficulty</th>
                                    <th>Language</th>
                                    <th>Solved Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {memberProbs.map((p, pIdx) => (
                                    <tr key={pIdx}>
                                      <td className="font-semibold">{p.title}</td>
                                      <td><span className="username-tag">{p.slug}</span></td>
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallengeProgressDetails;
