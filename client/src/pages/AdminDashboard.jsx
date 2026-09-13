import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardOverview } from '../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminDashboardOverview();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard overview:', err);
      setError(err.response?.data?.message || 'Failed to load Admin Dashboard overview.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const renderStatusBadge = (status) => {
    if (status === 'ACTIVE' || status === 'COMPLETED') {
      return <span className="status-badge status-active">{status}</span>;
    }
    if (status === 'INACTIVE' || status === 'EXPIRED') {
      return <span className="status-badge status-inactive">{status}</span>;
    }
    return <span className="status-badge status-no-activity">{status || 'NO ACTIVITY'}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard 2.0...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary"
            style={{ marginLeft: '1rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, teams, challenges, members, sync, recentActivity } = dashboardData || {};

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="welcome-subtitle">Overview of members, teams, challenges, and sync status</p>
        </div>
        <div className="stat-summary-badge">
          <span>Total Registered Members:</span>
          <strong>{overview?.totalMembers || 0}</strong>
        </div>
      </div>

      {/* 1. Section A — KPI Cards */}
      <div className="stats-grid" style={{ padding: 0, marginBottom: '1.5rem' }}>
        <div className="stat-box">
          <span className="stat-title">Total Members</span>
          <span className="stat-number highlight-total">{overview?.totalMembers || 0}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Registered member accounts
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-title">LeetCode Connected</span>
          <span className="stat-number text-easy">{overview?.connectedMembers || 0}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Active connected profiles
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-title">Total Teams</span>
          <span className="stat-number highlight-total">{overview?.totalTeams || 0}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Active member teams
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-title">Active Challenges</span>
          <span className="stat-number text-medium">{overview?.activeChallenges || 0}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Ongoing team sprints
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-title">Completed Challenges</span>
          <span className="stat-number text-easy">{overview?.completedChallenges || 0}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Finished team challenges
          </span>
        </div>
      </div>

      {/* 2. Section B — Team Performance */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header dashboard-header-flex">
          <h3>Team Performance</h3>
          <Link to="/admin/teams" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
            Manage Teams →
          </Link>
        </div>
        <div className="card-body">
          {!teams || teams.length === 0 ? (
            <p className="not-connected-tag">No teams created yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {teams.map((t) => (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{t.name}</h4>
                    <span className="user-profile-badge" style={{ fontSize: '0.75rem' }}>
                      {t.memberCount} Members
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span>Overall Target Progress</span>
                    <span>
                      {t.solved} / {t.target} ({t.percentage}%)
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                    <div style={{ width: `${t.percentage}%`, height: '100%', backgroundColor: t.percentage === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                    <span>Remaining: {t.remaining}</span>
                    <span>
                      Challenges: {t.activeChallengeCount} Active | {t.completedChallengeCount} Completed
                    </span>
                  </div>

                  <Link
                    to={`/admin/teams/${t.id}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', width: '100%', textAlign: 'center', textDecoration: 'none', padding: '0.4rem' }}
                  >
                    View Team Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid Row: Challenge Overview & Sync Health */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* 3. Section C — Challenge Overview */}
        <div className="card">
          <div className="card-header dashboard-header-flex">
            <h3>Challenge Overview</h3>
            <Link to="/admin/challenges" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              View All Challenges →
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {!challenges || challenges.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No active or recent challenges.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Challenge</th>
                      <th>Team</th>
                      <th>Target / Solved</th>
                      <th>Status</th>
                      <th>End Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {challenges.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold">
                          <Link to={`/admin/challenges/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                            {c.title}
                          </Link>
                        </td>
                        <td>{c.teamName}</td>
                        <td>
                          {c.target} / <span className="text-easy">{c.difficulty}</span>
                        </td>
                        <td>{renderStatusBadge(c.status)}</td>
                        <td className="sync-time">{formatDate(c.endDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 5. Section E — Automatic Sync Health */}
        <div className="card">
          <div className="card-header dashboard-header-flex">
            <h3>Automatic Sync Health</h3>
            <span className="status-badge status-active">{sync?.status || 'Active'}</span>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Scheduler Status</span>
              <span className="info-value">ENABLED (Server-side)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Sync Interval</span>
              <span className="info-value">{sync?.frequency || 'Every 1 hour'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Run</span>
              <span className="info-value">{formatDateTime(sync?.lastRun)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Connected Members</span>
              <span className="info-value">{sync?.connectedMembers || 0}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Run Success Rate</span>
              <span className="info-value" style={{ color: 'var(--status-easy)', fontWeight: 600 }}>
                {sync?.successful ?? '—'} / {sync?.attempted ?? '—'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Failed Syncs</span>
              <span className="info-value" style={{ color: sync?.failed > 0 ? 'var(--status-hard)' : 'var(--text)' }}>
                {sync?.failed ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section D — Member Activity */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header dashboard-header-flex">
          <h3>Member Activity</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/admin/users" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              View All Members →
            </Link>
            <Link to="/admin/streaks" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              View Streaks →
            </Link>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!members || members.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <p>No registered members found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>LeetCode</th>
                    <th>Total Solved</th>
                    <th>Current Streak</th>
                    <th>Activity Status</th>
                    <th>Last Activity</th>
                    <th>Last Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="font-semibold">{m.name}</td>
                      <td>
                        {m.leetcodeUsername ? (
                          <span className="username-tag">@{m.leetcodeUsername}</span>
                        ) : (
                          <span className="not-connected-tag">Not connected</span>
                        )}
                      </td>
                      <td className="font-semibold">
                        {m.leetcodeUsername ? <span className="highlight-total">{m.totalSolved}</span> : '—'}
                      </td>
                      <td>
                        <span className="text-medium" style={{ fontWeight: 600 }}>
                          🔥 {m.currentStreak} day{m.currentStreak === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td>{renderStatusBadge(m.activityStatus)}</td>
                      <td className="sync-time">{formatDate(m.lastActivity)}</td>
                      <td className="sync-time">{formatDateTime(m.lastSynced)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Grid Row: Recent Activity & Quick Actions */}
      <div className="dashboard-grid">
        {/* 6. Section F — Recent Activity */}
        <div className="card">
          <div className="card-header dashboard-header-flex">
            <h3>Recent LeetCode Submissions</h3>
            <Link to="/admin/solved-problems" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
              Full History →
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {!recentActivity || recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No recent LeetCode activity recorded.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Problem Title</th>
                      <th>Difficulty</th>
                      <th>Language</th>
                      <th>Solved Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((sub) => (
                      <tr key={sub.id}>
                        <td className="font-semibold">{sub.memberName}</td>
                        <td>
                          {sub.slug ? (
                            <a
                              href={`https://leetcode.com/problems/${sub.slug}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                            >
                              {sub.title}
                            </a>
                          ) : (
                            <span>{sub.title}</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                sub.difficulty === 'EASY'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : sub.difficulty === 'MEDIUM'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color:
                                sub.difficulty === 'EASY'
                                  ? 'var(--status-easy)'
                                  : sub.difficulty === 'MEDIUM'
                                  ? 'var(--status-medium)'
                                  : 'var(--status-hard)',
                            }}
                          >
                            {sub.difficulty}
                          </span>
                        </td>
                        <td>{sub.language}</td>
                        <td className="sync-time">{formatDate(sub.solvedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 7. Section G — Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/admin/users" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Manage Users</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/admin/teams" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Manage Teams</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/admin/challenges" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Challenges</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/leaderboard" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Leaderboard</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/admin/streaks" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Streaks</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/analytics" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Analytics</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
              <Link to="/admin/solved-problems" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.65rem 1rem' }}>
                <span>Solved Problems</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
