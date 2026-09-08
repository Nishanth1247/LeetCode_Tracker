import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      if (res.data && res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.response?.data?.message || 'Failed to load team members.');
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
