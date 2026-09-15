import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getLeaderboardPrivacy, updateLeaderboardPrivacy } from '../services/api';

const Leaderboard = () => {
  const { user, isAdmin } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Privacy toggle state for member
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [privacyUpdating, setPrivacyUpdating] = useState(false);
  const [privacyError, setPrivacyError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    if (!isAdmin) {
      fetchPrivacySetting();
    }
  }, [isAdmin]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPrivacyModal) {
        setShowPrivacyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPrivacyModal]);

  const fetchPrivacySetting = async () => {
    try {
      const res = await getLeaderboardPrivacy();
      if (res.success) {
        setLeaderboardOptIn(Boolean(res.data.leaderboardOptIn));
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard privacy setting:', err);
    }
  };

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

  const handleTogglePrivacy = async (e) => {
    const newOptInValue = e.target.checked;
    const previousOptInValue = leaderboardOptIn;

    // Optimistically update UI
    setLeaderboardOptIn(newOptInValue);
    setPrivacyUpdating(true);
    setPrivacyError('');

    try {
      const res = await updateLeaderboardPrivacy(newOptInValue);
      if (res.success) {
        setLeaderboardOptIn(Boolean(res.data.leaderboardOptIn));
        // Refresh leaderboard rankings immediately
        const lbRes = await getLeaderboard();
        if (lbRes.success) {
          setLeaderboard(lbRes.data || []);
        }
      } else {
        throw new Error('Failed response from server');
      }
    } catch (err) {
      console.error('Error updating leaderboard privacy:', err);
      // Revert toggle state on error
      setLeaderboardOptIn(previousOptInValue);
      setPrivacyError('Unable to update leaderboard privacy. Please try again.');
    } finally {
      setPrivacyUpdating(false);
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
          <h1>
            Team Leaderboard
            {isAdmin && <span className="role-badge badge-admin" style={{ marginLeft: '0.75rem', fontSize: '0.75rem' }}>Admin View — All connected members</span>}
          </h1>
          <p className="welcome-subtitle">
            {isAdmin
              ? 'Administrator view listing all connected team members'
              : 'Rankings of team members who opted in to share their statistics'}
          </p>
        </div>
        <div className="stat-summary-badge">
          <span>Active Competitors:</span>
          <strong>{leaderboard.length}</strong>
        </div>
      </div>

      {privacyError && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <span>⚠️ {privacyError}</span>
        </div>
      )}

      {/* MEMBER PRIVACY CONTROL BAR */}
      {!isAdmin && (
        <div className="toggle-switch-container">
          <div className="toggle-switch-group">
            <label className="toggle-switch" htmlFor="leaderboard-privacy-toggle">
              <input
                id="leaderboard-privacy-toggle"
                type="checkbox"
                checked={leaderboardOptIn}
                onChange={handleTogglePrivacy}
                disabled={privacyUpdating}
                aria-checked={leaderboardOptIn}
                aria-label="Show me on leaderboard"
              />
              <span className="toggle-slider"></span>
            </label>
            <label htmlFor="leaderboard-privacy-toggle" className="toggle-switch-label">
              Show me on leaderboard
            </label>
            <span className={`toggle-state-badge ${leaderboardOptIn ? 'on' : 'off'}`}>
              {privacyUpdating ? 'Updating...' : leaderboardOptIn ? 'ON' : 'OFF'}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPrivacyModal(true)}
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
          >
            View Details
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-state">
            <p>
              {isAdmin
                ? 'No connected team members yet.'
                : 'No team members have opted into leaderboard sharing yet.'}
            </p>
            <span className="card-description">
              {isAdmin
                ? 'Connected team members will appear here.'
                : !leaderboardOptIn
                ? 'Turn on "Show me on leaderboard" to participate.'
                : 'Share details with your teammates to get them on the board.'}
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
                  <th>Points</th>
                  <th>Easy (1x)</th>
                  <th>Medium (2.5x)</th>
                  <th>Hard (5x)</th>
                  <th>Total Solved</th>
                  <th>Last Synced</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((member, index) => {
                  const rank = index + 1;
                  const isCurrentUser = user && user.id === member.id;
                  const pts = member.leaderboardScore !== undefined
                    ? member.leaderboardScore
                    : (member.leetcode_easy_solved || 0) * 1 + (member.leetcode_medium_solved || 0) * 2.5 + (member.leetcode_hard_solved || 0) * 5;

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
                        <span className="highlight-total" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          {Number(pts).toFixed(1)} pts
                        </span>
                      </td>
                      <td className="text-easy">{member.leetcode_easy_solved}</td>
                      <td className="text-medium">{member.leetcode_medium_solved}</td>
                      <td className="text-hard">{member.leetcode_hard_solved}</td>
                      <td className="font-semibold">{member.leetcode_total_solved}</td>
                      <td className="sync-time">{formatLastSynced(member.leetcode_last_synced)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRIVACY DETAILS MODAL */}
      {showPrivacyModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowPrivacyModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="privacy-modal-title">Leaderboard Privacy</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowPrivacyModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Your leaderboard visibility controls whether other team members can see you on the MEMBER leaderboard.
              </p>

              <h4 className="modal-section-title">When turned ON</h4>
              <ul className="modal-list">
                <li>Your name can appear on the team leaderboard.</li>
                <li>Your LeetCode progress can be compared with other members who have opted in.</li>
                <li>Your leaderboard position and relevant leaderboard statistics can be visible to other participating members.</li>
              </ul>

              <h4 className="modal-section-title">When turned OFF</h4>
              <ul className="modal-list">
                <li>You are hidden from the MEMBER leaderboard.</li>
                <li>Other members cannot see you in the member leaderboard.</li>
                <li>Your stored LeetCode statistics are not deleted.</li>
                <li>Your LeetCode account remains connected.</li>
                <li>Your personal analytics, challenges, activity, and other dashboard features continue to work.</li>
              </ul>

              <h4 className="modal-section-title">Important</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                Admins can still view connected members through the admin leaderboard view, according to the existing admin functionality. Changing this setting only controls MEMBER leaderboard visibility.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowPrivacyModal(false)}
                style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

