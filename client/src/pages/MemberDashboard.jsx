import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyLeetCodeStats,
  connectLeetCode,
  syncLeetCode,
  getMyActivity,
  getLeaderboardPrivacy,
  updateLeaderboardPrivacy,
} from '../services/api';

const MemberDashboard = () => {
  const { user } = useAuth();

  const [statsData, setStatsData] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Activity state
  const [activityData, setActivityData] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');

  // Privacy Consent state
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySuccessMsg, setPrivacySuccessMsg] = useState('');

  useEffect(() => {
    fetchStats();
    fetchPrivacy();
  }, []);

  useEffect(() => {
    if (statsData?.username) {
      fetchActivity();
    }
  }, [statsData?.username]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyLeetCodeStats();
      if (res.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching LeetCode stats:', err);
      setError('Failed to load LeetCode data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacy = async () => {
    try {
      const res = await getLeaderboardPrivacy();
      if (res.success) {
        setLeaderboardOptIn(Boolean(res.data.leaderboardOptIn));
      }
    } catch (err) {
      console.error('Error fetching leaderboard privacy:', err);
    }
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    try {
      setPrivacyLoading(true);
      setPrivacySuccessMsg('');
      const res = await updateLeaderboardPrivacy(leaderboardOptIn);
      if (res.success) {
        setLeaderboardOptIn(Boolean(res.data.leaderboardOptIn));
        setPrivacySuccessMsg(
          leaderboardOptIn
            ? 'Leaderboard visibility enabled! You will appear on the team leaderboard.'
            : 'Leaderboard visibility disabled. You will not appear on the member leaderboard.'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update privacy setting.');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      setActivityLoading(true);
      setActivityError('');
      const res = await getMyActivity();
      if (res.success) {
        setActivityData(res.data);
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
      setActivityError(
        err.response?.data?.message || 'Unable to load recent activity.'
      );
    } finally {
      setActivityLoading(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setError('Please enter a valid LeetCode username.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await connectLeetCode(usernameInput.trim());
      if (res.success) {
        setStatsData(res.data);
        setSuccessMsg('LeetCode profile connected successfully!');
        setUsernameInput('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Unable to fetch LeetCode profile. Please check the username and try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Waiting for first automatic sync';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatActivityDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
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
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p className="welcome-subtitle">Welcome back, <strong>{user?.name}</strong>!</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <span>✓ {successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading LeetCode profile...</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* User Profile Overview */}
          <div className="card profile-card">
            <div className="card-header">
              <h3>Profile Overview</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">LeetCode Status</span>
                <span className="info-value">
                  {statsData?.username ? (
                    <span className="role-badge badge-member">Connected</span>
                  ) : (
                    <span className="role-badge badge-admin">Not Connected</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* LeetCode Connection / Stats Section */}
          {!statsData?.username ? (
            <div className="card connect-card">
              <div className="card-header">
                <h3>Connect Your LeetCode Account</h3>
              </div>
              <div className="card-body">
                <p className="card-description">
                  Enter your public LeetCode username below to connect your profile and track your solved problem statistics.
                </p>
                <form onSubmit={handleConnect} className="connect-form">
                  <div className="form-group">
                    <label htmlFor="leetcodeUsername">LeetCode Username</label>
                    <input
                      id="leetcodeUsername"
                      type="text"
                      placeholder="e.g. arun123"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      disabled={actionLoading}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Connecting to LeetCode...' : 'Connect LeetCode'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card stats-card">
              <div className="card-header dashboard-header-flex">
                <h3>LeetCode Progress</h3>
                <span className="username-tag">@{statsData.username}</span>
              </div>
              <div className="stats-grid">
                <div className="stat-box total">
                  <span className="stat-title">Total Solved</span>
                  <span className="stat-number highlight-total">{statsData.totalSolved}</span>
                </div>
                <div className="stat-box easy">
                  <span className="stat-title">Easy</span>
                  <span className="stat-number text-easy">{statsData.easySolved}</span>
                </div>
                <div className="stat-box medium">
                  <span className="stat-title">Medium</span>
                  <span className="stat-number text-medium">{statsData.mediumSolved}</span>
                </div>
                <div className="stat-box hard">
                  <span className="stat-title">Hard</span>
                  <span className="stat-number text-hard">{statsData.hardSolved}</span>
                </div>
              </div>

              <div className="card-footer sync-footer">
                <div className="sync-info">
                  <span className="info-label">Last Synced:</span>
                  <span className="sync-time">{formatDate(statsData.lastSynced)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* V7 LEADERBOARD PRIVACY CONSENT SECTION */}
      <div className="card privacy-section-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Leaderboard Visibility & Privacy</h3>
        </div>
        <div className="card-body">
          {privacySuccessMsg && (
            <div className="alert alert-success">
              <span>✓ {privacySuccessMsg}</span>
            </div>
          )}
          <p className="card-description">
            When enabled, your LeetCode username and statistics can be viewed by other team members on the team leaderboard.
          </p>
          <form onSubmit={handlePrivacySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={leaderboardOptIn}
                onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                disabled={privacyLoading}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Show my LeetCode statistics on the team leaderboard.</span>
            </label>
            <div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={privacyLoading}
                style={{ width: 'auto', padding: '0.5rem 1.2rem' }}
              >
                {privacyLoading ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* V4 RECENT LEETCODE ACTIVITY SECTION */}
      {statsData?.username && (
        <div className="card activity-section-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header dashboard-header-flex">
            <h3>Recent LeetCode Activity</h3>
            {activityData && getStatusBadge(activityData.status)}
          </div>
          <div className="card-body">
            {activityError && (
              <div className="alert alert-error">
                <span>⚠️ {activityError}</span>
              </div>
            )}

            {activityLoading ? (
              <div className="loading-container" style={{ minHeight: '120px' }}>
                <div className="spinner"></div>
                <p>Loading activity...</p>
              </div>
            ) : activityData?.submissions && activityData.submissions.length > 0 ? (
              <div className="activity-container">
                <div className="info-row" style={{ marginBottom: '1rem' }}>
                  <span className="info-label">Last Activity Date</span>
                  <span className="info-value">
                    {formatActivityDate(activityData.lastActivity)}
                  </span>
                </div>
                <h4 className="activity-list-title">Recent Accepted Problems</h4>
                <ul className="activity-list">
                  {activityData.submissions.slice(0, 5).map((sub, index) => (
                    <li key={index} className="activity-item">
                      <div className="activity-item-main">
                        <span className="activity-index">{index + 1}.</span>
                        {sub.slug ? (
                          <a
                            href={`https://leetcode.com/problems/${sub.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="activity-title-link"
                          >
                            {sub.title}
                          </a>
                        ) : (
                          <span className="activity-title">{sub.title}</span>
                        )}
                      </div>
                      <div className="activity-item-meta">
                        {sub.language && <span className="language-tag">{sub.language}</span>}
                        <span className="activity-date">
                          {formatActivityDate(sub.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p>No recent accepted submissions found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
