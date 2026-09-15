import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminMemberPerformanceDetail } from '../services/api';

const AdminMemberPerformanceDetail = () => {
  const { userId } = useParams();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminMemberPerformanceDetail(userId);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
        console.error('[AdminMemberPerformanceDetail Error Debug]:', {
          status: err.response?.status,
          message: err.response?.data?.message || err.message,
          data: err.response?.data,
        });
      }
      setError(err.response?.data?.message || 'Failed to fetch member performance details.');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading member detail metrics...</p>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">{error || 'Member data unavailable.'}</div>
        <Link to="/admin/member-performance" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
          ← Back to Member Performance
        </Link>
      </div>
    );
  }

  const { profile, streaks, goals, inactivity, recentSubmissions } = detailData;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">{profile.name} — Performance Details</h1>
          <p className="welcome-subtitle">Individual member profile, activity goals, and submission metrics</p>
        </div>
        <Link to="/admin/member-performance" className="btn btn-secondary" style={{ textDecoration: 'none', width: 'auto' }}>
          ← Back to Member Performance
        </Link>
      </div>

      {/* Grid: Profile & Goals */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3>Member Profile</h3>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value font-semibold">{profile.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned Team</span>
              <span className="info-value">
                <span className="user-profile-badge">{profile.teamName}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">LeetCode Username</span>
              <span className="info-value">
                {profile.leetcodeUsername ? (
                  <span className="username-tag">@{profile.leetcodeUsername}</span>
                ) : (
                  <span className="not-connected-tag">Not connected</span>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Activity</span>
              <span className="info-value">{formatDate(profile.lastActivity)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Synced</span>
              <span className="info-value sync-time">{formatDateTime(profile.lastSynced)}</span>
            </div>
          </div>
        </div>

        {/* Goals & Streak Overview */}
        <div className="card">
          <div className="card-header">
            <h3>Goals & Streaks Summary</h3>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ padding: 0, marginBottom: '1.25rem' }}>
              <div className="stat-box">
                <span className="stat-title">Current Streak</span>
                <span className="stat-number text-easy">🔥 {streaks.currentStreak} d</span>
              </div>
              <div className="stat-box">
                <span className="stat-title">Longest Streak</span>
                <span className="stat-number text-easy">{streaks.longestStreak} d</span>
              </div>
              <div className="stat-box">
                <span className="stat-title">Inactive (Week)</span>
                <span className="stat-number text-hard">{inactivity?.inactiveDays ?? 0} d</span>
              </div>
              <div className="stat-box">
                <span className="stat-title">Monthly Goal</span>
                <span className="stat-number highlight-total">
                  {goals.monthlyGoal ? `${goals.monthlyGoal} p` : 'None'}
                </span>
              </div>
            </div>

            {/* Weekly Activity Breakdown */}
            {inactivity?.daysBreakdown && inactivity.daysBreakdown.length > 0 && (
              <div style={{ marginBottom: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.4rem' }}>
                  Weekly Activity Breakdown (Mon–Today):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {inactivity.daysBreakdown.map((item) => (
                    <div
                      key={item.date}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.active ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${item.active ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: item.active ? 'var(--status-easy)' : 'var(--status-hard)',
                        textAlign: 'center',
                      }}
                    >
                      <span>{item.day}</span> {item.active ? '✓' : '—'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goals.monthlyGoal && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Monthly Goal Progress</span>
                  <span>{goals.monthlySolved} / {goals.monthlyGoal} ({goals.monthlyPct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${goals.monthlyPct}%`, height: '100%', backgroundColor: goals.monthlyPct >= 80 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Solved Breakdown & Submissions History */}
      <div className="dashboard-grid">
        {/* Difficulty Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Solved Difficulty Breakdown</h3>
          </div>
          <div className="card-body">
            <div className="stats-grid" style={{ padding: 0 }}>
              <div className="stat-box total">
                <span className="stat-title">Total Solved</span>
                <span className="stat-number highlight-total">{profile.totalSolved}</span>
              </div>
              <div className="stat-box easy">
                <span className="stat-title">Easy</span>
                <span className="stat-number text-easy">{profile.easySolved}</span>
              </div>
              <div className="stat-box medium">
                <span className="stat-title">Medium</span>
                <span className="stat-number text-medium">{profile.mediumSolved}</span>
              </div>
              <div className="stat-box hard">
                <span className="stat-title">Hard</span>
                <span className="stat-number text-hard">{profile.hardSolved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Accepted Submissions</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentSubmissions.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No tracked submissions for this member yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th>Language</th>
                      <th>Solved Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((s, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{s.title}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                s.difficulty === 'EASY'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : s.difficulty === 'MEDIUM'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color:
                                s.difficulty === 'EASY'
                                  ? 'var(--status-easy)'
                                  : s.difficulty === 'MEDIUM'
                                  ? 'var(--status-medium)'
                                  : 'var(--status-hard)',
                            }}
                          >
                            {s.difficulty || 'MIXED'}
                          </span>
                        </td>
                        <td>{s.language || 'Code'}</td>
                        <td className="sync-time">{formatDate(s.solvedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMemberPerformanceDetail;
