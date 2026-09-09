import React, { useState, useEffect } from 'react';
import api, { getAdminSubmissions } from '../services/api';

const AdminSolvedProblems = () => {
  const [members, setMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchMembers();
    // Default dates: past 30 days
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setFromDate(thirtyDaysAgo);
    setToDate(today);
  }, []);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      setError('');
      const res = await api.get('/users');
      if (res.data && res.data.success) {
        // Filter only MEMBER role users
        const memberList = (res.data.data || []).filter((u) => u.role === 'MEMBER');
        setMembers(memberList);
        if (memberList.length > 0) {
          setSelectedUserId(memberList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.response?.data?.message || 'Failed to load members.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !fromDate || !toDate) return;

    if (new Date(toDate) < new Date(fromDate)) {
      setError("'From' date cannot be after 'To' date.");
      return;
    }

    try {
      setSearching(true);
      setError('');
      setResultData(null);

      const res = await getAdminSubmissions(selectedUserId, fromDate, toDate);
      if (res.success) {
        setResultData(res.data);
      }
    } catch (err) {
      console.error('getAdminSubmissions error:', err);
      setError(err.response?.data?.message || 'Failed to fetch solved problems history.');
    } finally {
      setSearching(false);
    }
  };

  if (loadingMembers) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading member list...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Historical Solved Problems</h1>
        <p className="welcome-subtitle">
          Query recorded LeetCode accepted submissions for any team member by date range
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Query Filter Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <form onSubmit={handleSearch} className="connect-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Select Member *</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.7rem',
                    color: 'var(--text)',
                  }}
                  required
                >
                  {members.length === 0 ? (
                    <option value="">No members available</option>
                  ) : (
                    members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.leetcode_username ? `@${m.leetcode_username}` : 'No LeetCode'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>To Date *</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: 'auto' }}
                disabled={searching || members.length === 0}
              >
                {searching ? 'Fetching...' : 'View Solved Problems'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {resultData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Card */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{resultData.member.name}</h3>
                <p className="welcome-subtitle">
                  LeetCode: {resultData.member.leetcodeUsername ? `@${resultData.member.leetcodeUsername}` : 'Not connected'}
                </p>
              </div>
              <span className="user-profile-badge">
                {resultData.dateRange.from} → {resultData.dateRange.to}
              </span>
            </div>
            <div className="card-body">
              <div className="stats-grid" style={{ padding: 0 }}>
                <div className="stat-box">
                  <span className="stat-title">Total Solved</span>
                  <span className="stat-number highlight-total">{resultData.summary.total}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Easy</span>
                  <span className="stat-number text-easy">{resultData.summary.easy}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Medium</span>
                  <span className="stat-number text-medium">{resultData.summary.medium}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Hard</span>
                  <span className="stat-number text-hard">{resultData.summary.hard}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Coverage Limitation Notice */}
          <div
            style={{
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              fontSize: '0.82rem',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>ℹ️</span>
            <span>
              <strong>Data Coverage Notice:</strong> Showing solved problems available in the recorded LeetCode submission history. Older activity may not be available.
            </span>
          </div>

          {/* Solved Problems Table */}
          <div className="card table-card">
            <div className="card-header">
              <h3>Recorded Solved Problems ({resultData.problems.length})</h3>
            </div>
            <div className="table-responsive">
              {resultData.problems.length === 0 ? (
                <div className="empty-state">
                  <p>No recorded solved problems found for this member during the selected period.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Problem Title</th>
                      <th>Slug</th>
                      <th>Difficulty</th>
                      <th>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.problems.map((p, idx) => (
                      <tr key={idx}>
                        <td>{new Date(p.solvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="font-semibold">{p.title}</td>
                        <td>
                          <span className="username-tag">{p.slug}</span>
                        </td>
                        <td>
                          {p.difficulty ? (
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor:
                                  p.difficulty === 'EASY'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : p.difficulty === 'MEDIUM'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)',
                                color:
                                  p.difficulty === 'EASY'
                                    ? 'var(--status-easy)'
                                    : p.difficulty === 'MEDIUM'
                                    ? 'var(--status-medium)'
                                    : 'var(--status-hard)',
                              }}
                            >
                              {p.difficulty}
                            </span>
                          ) : (
                            <span className="not-connected-tag">Unspecified</span>
                          )}
                        </td>
                        <td>{p.language ? <span className="language-tag">{p.language}</span> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolvedProblems;
