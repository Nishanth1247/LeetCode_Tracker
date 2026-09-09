import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getAllTeams, getAllChallenges } from '../services/api';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [teamsCount, setTeamsCount] = useState(0);
  const [activeChallengesCount, setActiveChallengesCount] = useState(0);
  const [completedChallengesCount, setCompletedChallengesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersRes, teamsRes, challengesRes] = await Promise.all([
        api.get('/users'),
        getAllTeams().catch(() => null),
        getAllChallenges().catch(() => null),
      ]);

      if (usersRes.data && usersRes.data.success) {
        setMembers(usersRes.data.data);
      }

      if (teamsRes && teamsRes.success) {
        setTeamsCount(teamsRes.data.length);
      }

      if (challengesRes && challengesRes.success) {
        const active = challengesRes.data.filter((c) => c.status === 'ACTIVE').length;
        const completed = challengesRes.data.filter((c) => c.status === 'COMPLETED').length;
        setActiveChallengesCount(active);
        setCompletedChallengesCount(completed);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard.');
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

  const getActivityStatus = (lastActivityDate) => {
    if (!lastActivityDate) return 'NO ACTIVITY';
    const diffMs = Date.now() - new Date(lastActivityDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 7 ? 'ACTIVE' : 'INACTIVE';
  };

  const renderStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="status-badge status-active">ACTIVE</span>;
    }
    if (status === 'INACTIVE') {
      return <span className="status-badge status-inactive">INACTIVE</span>;
    }
    return <span className="status-badge status-no-activity">NO ACTIVITY</span>;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="welcome-subtitle">Team member LeetCode statistics & activity overview</p>
        </div>
        <div className="stat-summary-badge">
          <span>Total Team Members:</span>
          <strong>{members.length}</strong>
        </div>
      </div>

      {/* V8 Teams & Challenges Summary Bar */}
      <div className="stats-grid" style={{ padding: 0, marginBottom: '1rem' }}>
        <div className="stat-box">
          <span className="stat-title">Total Teams</span>
          <span className="stat-number highlight-total">{teamsCount}</span>
          <Link to="/admin/teams" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginTop: '0.3rem' }}>
            Manage Teams →
          </Link>
        </div>
        <div className="stat-box">
          <span className="stat-title">Active Challenges</span>
          <span className="stat-number text-easy">{activeChallengesCount}</span>
          <Link to="/admin/challenges" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginTop: '0.3rem' }}>
            Manage Challenges →
          </Link>
        </div>
        <div className="stat-box">
          <span className="stat-title">Completed Challenges</span>
          <span className="stat-number text-medium">{completedChallengesCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">History Viewer</span>
          <Link to="/admin/solved-problems" className="btn btn-secondary" style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none' }}>
            Historical Solved →
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching team members...</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="card-header">
            <h3>Team Members & Activity</h3>
          </div>
          <div className="table-responsive">
            {members.length === 0 ? (
              <div className="empty-state">
                <p>No registered team members found yet.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>LeetCode Username</th>
                    <th>Total Solved</th>
                    <th>Easy</th>
                    <th>Medium</th>
                    <th>Hard</th>
                    <th>Status</th>
                    <th>Last Activity</th>
                    <th>Last Synced</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const status = member.leetcode_username
                      ? getActivityStatus(member.leetcode_last_activity)
                      : null;

                    return (
                      <tr key={member.id}>
                        <td className="font-semibold">{member.name}</td>
                        <td>{member.email}</td>
                        <td>
                          {member.leetcode_username ? (
                            <span className="username-tag">@{member.leetcode_username}</span>
                          ) : (
                            <span className="not-connected-tag">Not Connected</span>
                          )}
                        </td>
                        <td className="font-semibold">
                          {member.leetcode_username ? (
                            <span className="highlight-total">{member.leetcode_total_solved ?? 0}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-easy">
                          {member.leetcode_username ? member.leetcode_easy_solved ?? 0 : '-'}
                        </td>
                        <td className="text-medium">
                          {member.leetcode_username ? member.leetcode_medium_solved ?? 0 : '-'}
                        </td>
                        <td className="text-hard">
                          {member.leetcode_username ? member.leetcode_hard_solved ?? 0 : '-'}
                        </td>
                        <td>{status ? renderStatusBadge(status) : '-'}</td>
                        <td>
                          {member.leetcode_username
                            ? formatDate(member.leetcode_last_activity)
                            : '-'}
                        </td>
                        <td className="sync-time">
                          {member.leetcode_username
                            ? formatDateTime(member.leetcode_last_synced)
                            : '-'}
                        </td>
                        <td>{formatDate(member.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
