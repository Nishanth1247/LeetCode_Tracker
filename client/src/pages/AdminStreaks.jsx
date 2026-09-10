import React, { useState, useEffect } from 'react';
import { getAdminStreaks, getAdminMemberStreakDetail } from '../services/api';

const AdminStreaks = () => {
  const [overview, setOverview] = useState({
    totalMembers: 0,
    activeToday: 0,
    avgCurrentStreak: 0,
    longestTeamStreak: 0,
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Member detail modal/panel state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStreaksOverview();
  }, []);

  const fetchStreaksOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAdminStreaks();
      if (res.success && res.data) {
        setOverview(res.data.overview || {});
        setMembers(res.data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch streaks:', err);
      setError(err.response?.data?.message || 'Failed to load team streak data.');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = async (userId) => {
    try {
      setSelectedUserId(userId);
      setLoadingDetail(true);
      setDetailData(null);
      const res = await getAdminMemberStreakDetail(userId);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch member streak detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Calculating team member streaks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1>Member Solving Streaks</h1>
          <p className="welcome-subtitle">
            Track daily LeetCode problem solving consistency across team members
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Overview Cards */}
      <div className="stats-grid" style={{ padding: 0, marginBottom: '1.5rem' }}>
        <div className="stat-box">
          <span className="stat-title">Total Members</span>
          <span className="stat-number highlight-total">{overview.totalMembers}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Active Today</span>
          <span className="stat-number text-easy">{overview.activeToday}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Avg Current Streak</span>
          <span className="stat-number text-medium">{overview.avgCurrentStreak} days</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Longest Team Streak</span>
          <span className="stat-number text-hard">{overview.longestTeamStreak} days</span>
        </div>
      </div>

      {/* Notice Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          fontSize: '0.82rem',
          color: 'var(--muted)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>ℹ️</span>
        <span>
          <strong>Data Coverage Notice:</strong> Streaks are calculated from available tracked LeetCode submission history. Multiple problems solved on the same calendar date count as 1 active day.
        </span>
      </div>

      {/* Member Detail Section / Modal */}
      {selectedUserId && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1.5px solid var(--primary)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Member Streak Details</h3>
            <button
              onClick={() => setSelectedUserId(null)}
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            >
              ✕ Close
            </button>
          </div>
          <div className="card-body">
            {loadingDetail ? (
              <div className="loading-container" style={{ minHeight: '120px' }}>
                <div className="spinner"></div>
                <p>Loading streak details...</p>
              </div>
            ) : detailData ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{detailData.member.name}</h3>
                    <p className="welcome-subtitle">
                      Team: <strong>{detailData.team.name}</strong> | LeetCode: {detailData.member.username ? `@${detailData.member.username}` : 'Not connected'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Current Streak</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>{detailData.currentStreak} days</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Longest Streak</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--status-easy)' }}>{detailData.longestStreak} days</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Total Active Days</span>
                      <strong style={{ fontSize: '1.3rem', color: 'var(--text)' }}>{detailData.totalActiveDays} days</strong>
                    </div>
                  </div>
                </div>

                {/* Calendar Activity Visualization */}
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', marginTop: '1rem' }}>Recent Active Solving Days</h4>
                {detailData.dailyActivity && detailData.dailyActivity.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {detailData.dailyActivity.map((dateStr, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: 'var(--status-easy)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        ● {dateStr}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    No recorded active solving days found in historical submission data.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="card table-card">
        <div className="card-header">
          <h3>Team Members Streak Overview ({members.length})</h3>
        </div>
        <div className="table-responsive">
          {members.length === 0 ? (
            <div className="empty-state">
              <p>No team members found.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Team</th>
                  <th>Active Today</th>
                  <th>Current Streak</th>
                  <th>Longest Streak</th>
                  <th>Total Active Days</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold">
                      {m.name}
                      {m.username && <div className="welcome-subtitle" style={{ fontSize: '0.75rem' }}>@{m.username}</div>}
                    </td>
                    <td>{m.teamName}</td>
                    <td>
                      {m.activeToday ? (
                        <span className="status-badge status-active">Yes ●</span>
                      ) : (
                        <span className="status-badge status-no-activity">No ○</span>
                      )}
                    </td>
                    <td className="font-semibold" style={{ color: m.currentStreak > 0 ? 'var(--primary)' : 'var(--muted)' }}>
                      {m.currentStreak} day{m.currentStreak === 1 ? '' : 's'}
                    </td>
                    <td className="font-semibold" style={{ color: 'var(--status-easy)' }}>
                      {m.longestStreak} day{m.longestStreak === 1 ? '' : 's'}
                    </td>
                    <td className="font-semibold">{m.totalActiveDays}</td>
                    <td>
                      <button
                        onClick={() => handleMemberClick(m.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        Inspect Calendar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStreaks;
