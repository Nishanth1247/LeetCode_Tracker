import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard } from '../services/api';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getLeaderboard();
      if (res.success) {
        setLeaderboard(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(err.response?.data?.message || 'Unable to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastSynced = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = Math.abs(now - date);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1>Team Leaderboard</h1>
          <p className="welcome-subtitle">
            Rankings based on connected team members' latest synced statistics
          </p>
        </div>
        <div className="stat-summary-badge">
          <span>Active Competitors:</span>
          <strong>{leaderboard.length}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-state">
            <p>No connected team members yet.</p>
            <span className="card-description">
              Team members who connect their LeetCode profile will appear here.
            </span>
          </div>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Member</th>
                  <th>LeetCode Username</th>
                  <th>Total Solved</th>
                  <th>Easy</th>
                  <th>Medium</th>
                  <th>Hard</th>
                  <th>Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((member, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user && user.id === member.id;

                  return (
                    <tr
                      key={member.id}
                      className={isCurrentUser ? 'current-user-row' : ''}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <span className={`rank-badge rank-${rank <= 3 ? rank : 'other'}`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="font-semibold">
                        {member.name}
                        {isCurrentUser && <span className="you-tag">You</span>}
                      </td>
                      <td>
                        <span className="username-tag">@{member.leetcode_username}</span>
                      </td>
                      <td className="font-semibold">
                        <span className="highlight-total">{member.leetcode_total_solved}</span>
                      </td>
                      <td className="text-easy">{member.leetcode_easy_solved}</td>
                      <td className="text-medium">{member.leetcode_medium_solved}</td>
                      <td className="text-hard">{member.leetcode_hard_solved}</td>
                      <td className="sync-time">{formatLastSynced(member.leetcode_last_synced)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
