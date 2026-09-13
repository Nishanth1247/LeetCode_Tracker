import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminTeamPerformance } from '../services/api';

const AdminTeamPerformance = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminTeamPerformance();
      if (res.success) {
        setTeams(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load team performance:', err);
      setError(err.response?.data?.message || 'Failed to load team performance evaluation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Calculating team performance metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Team Performance Comparison</h1>
          <p className="welcome-subtitle">Comprehensive team evaluation & composite performance ranking</p>
        </div>
        <div className="stat-summary-badge">
          <span>Evaluated Teams:</span>
          <strong>{teams.length}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Explanation Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.1rem',
          fontSize: '0.85rem',
          color: 'var(--muted)',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>
          ℹ️ Composite Performance Score Calculation Formula:
        </span>
        Composite score is evaluated out of 100 based on:
        <strong style={{ color: 'var(--text)' }}> 50% Challenge Target Completion</strong> +
        <strong style={{ color: 'var(--text)' }}> 30% Monthly Solved Activity</strong> +
        <strong style={{ color: 'var(--text)' }}> 20% Active Member Ratio</strong>.
      </div>

      {teams.length === 0 ? (
        <div className="card empty-state">
          <h3>No Team Performance Data Available</h3>
          <p>Create teams and assign challenges to begin evaluating team performance.</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
                  <th>Team Name</th>
                  <th>Members</th>
                  <th>Total Solved</th>
                  <th>Solved (Month)</th>
                  <th>Avg / Member</th>
                  <th>Avg Current Streak</th>
                  <th>Active Challenges</th>
                  <th>Challenge Completion %</th>
                  <th style={{ textAlign: 'right' }}>Composite Score</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.id}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`rank-badge rank-${t.rank <= 3 ? t.rank : 'other'}`}>
                        #{t.rank}
                      </span>
                    </td>
                    <td className="font-semibold">{t.name}</td>
                    <td>{t.memberCount}</td>
                    <td className="font-semibold">
                      <span className="highlight-total">{t.totalSolved}</span>
                    </td>
                    <td className="text-easy">{t.solvedThisMonth}</td>
                    <td>{t.avgProblemsPerMember}</td>
                    <td className="text-medium">🔥 {t.avgCurrentStreak} d</td>
                    <td>{t.activeChallenges}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${t.challengeCompletionPct}%`, height: '100%', backgroundColor: t.challengeCompletionPct === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{t.challengeCompletionPct}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="user-profile-badge" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {t.compositeScore} / 100
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/teams/${t.id}`}
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        Manage →
                      </Link>
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

export default AdminTeamPerformance;
