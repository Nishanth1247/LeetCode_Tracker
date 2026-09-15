import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminMemberLanguageAnalytics } from '../services/api';

const AdminLanguageAnalytics = () => {
  const [members, setMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchLanguageAnalytics(selectedUserId);
    } else {
      setAnalyticsData(null);
    }
  }, [selectedUserId]);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      setError('');
      const res = await getAdminUsers();
      if (res.success) {
        // Filter only MEMBER role users
        const memberUsers = (res.data || []).filter((u) => u.role === 'MEMBER');
        setMembers(memberUsers);
        if (memberUsers.length > 0) {
          setSelectedUserId(String(memberUsers[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load members for language analytics:', err);
      setError('Unable to load member accounts.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchLanguageAnalytics = async (userId) => {
    try {
      setLoadingAnalytics(true);
      setError('');
      const res = await getAdminMemberLanguageAnalytics(userId);
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load language statistics:', err);
      setError(err.response?.data?.message || 'Unable to load language statistics.');
      setAnalyticsData(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const selectedMemberObj = members.find((m) => String(m.id) === String(selectedUserId));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Language Analytics</h1>
          <p className="welcome-subtitle">Unique solved problems breakdown by programming language per member</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Member Selector Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label htmlFor="member-select" style={{ fontWeight: 600, fontSize: '0.92rem' }}>
            Select Member:
          </label>
          {loadingMembers ? (
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Loading members...</span>
          ) : (
            <select
              id="member-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text)',
                fontWeight: 500,
                fontSize: '0.9rem',
                minWidth: '220px',
                cursor: 'pointer',
              }}
            >
              {members.length === 0 ? (
                <option value="">No member accounts found</option>
              ) : (
                members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.leetcodeUsername ? `(@${m.leetcodeUsername})` : '(Not connected)'}
                  </option>
                ))
              )}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loadingAnalytics ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading language statistics...</p>
        </div>
      ) : !analyticsData || analyticsData.languages.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-state">
            <p>No solved problem language data available.</p>
            <span className="card-description">
              {selectedMemberObj?.leetcodeUsername
                ? 'No accepted submission history recorded for this member yet.'
                : 'This member has not connected a LeetCode profile.'}
            </span>
          </div>
        </div>
      ) : (
        <div>
          {/* Member Overview Cards */}
          <div className="stats-grid" style={{ padding: 0, marginBottom: '1.5rem' }}>
            <div className="stat-box">
              <span className="stat-title">Selected Member</span>
              <span className="stat-number highlight-total" style={{ fontSize: '1.2rem' }}>
                {analyticsData.member.name}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {analyticsData.member.leetcodeUsername ? `@${analyticsData.member.leetcodeUsername}` : 'Not connected'}
              </span>
            </div>

            <div className="stat-box">
              <span className="stat-title">Total Unique Solved</span>
              <span className="stat-number text-easy">{analyticsData.totalUniqueSolved}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Unique problems solved
              </span>
            </div>

            <div className="stat-box">
              <span className="stat-title">Languages Used</span>
              <span className="stat-number text-medium">{analyticsData.languageCount}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                Programming languages
              </span>
            </div>
          </div>

          {/* Visualization: Horizontal Bar Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h3>Language Distribution (Unique Problems)</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData.languages.map((langItem) => (
                <div key={langItem.language}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <span>{langItem.language}</span>
                    <span>
                      {langItem.count} {langItem.count === 1 ? 'problem' : 'problems'} ({langItem.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(2, langItem.percentage)}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '5px',
                        transition: 'width 0.3s ease',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages Data Table */}
          <div className="card table-card">
            <div className="card-header">
              <h3>Language Breakdown</h3>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Language</th>
                    <th>Unique Problems Solved</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.languages.map((langItem) => (
                    <tr key={langItem.language}>
                      <td className="font-semibold">{langItem.language}</td>
                      <td className="font-semibold">{langItem.count}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{langItem.percentage}%</span>
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${langItem.percentage}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLanguageAnalytics;
