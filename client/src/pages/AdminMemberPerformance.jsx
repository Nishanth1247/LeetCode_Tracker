import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminMemberPerformance, getAllTeams } from '../services/api';

const AdminMemberPerformance = () => {
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersRes, teamsRes] = await Promise.all([
        getAdminMemberPerformance(),
        getAllTeams().catch(() => null),
      ]);

      if (membersRes.success) {
        setMembers(membersRes.data || []);
      }
      if (teamsRes && teamsRes.success) {
        setTeams(teamsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load member performance:', err);
      setError(err.response?.data?.message || 'Failed to load member performance evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      m.name.toLowerCase().includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      (m.leetcodeUsername && m.leetcodeUsername.toLowerCase().includes(searchLower));

    const matchesTeam =
      selectedTeamFilter === 'ALL' ||
      (selectedTeamFilter === 'UNASSIGNED' && m.teamName === 'Unassigned') ||
      m.teamName === selectedTeamFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || m.performanceStatus === selectedStatusFilter;

    return matchesSearch && matchesTeam && matchesStatus;
  });

  const renderPerformanceBadge = (status) => {
    if (status === 'EXCELLENT') {
      return <span className="status-badge status-active">EXCELLENT</span>;
    }
    if (status === 'GOOD') {
      return <span className="status-badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary)' }}>GOOD</span>;
    }
    return <span className="status-badge status-inactive">NEEDS ATTENTION</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading member performance data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Member Performance Evaluation</h1>
          <p className="welcome-subtitle">Member activity, monthly goals, streaks & performance status</p>
        </div>
        <div className="stat-summary-badge">
          <span>Evaluated Members:</span>
          <strong>{members.length}</strong>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Filters */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 250px', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search member name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem 0.8rem',
              color: 'var(--text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              color: 'var(--text)',
              fontSize: '0.88rem',
            }}
          >
            <option value="ALL">All Teams</option>
            <option value="UNASSIGNED">Unassigned</option>
            {teams.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              color: 'var(--text)',
              fontSize: '0.88rem',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="EXCELLENT">EXCELLENT</option>
            <option value="GOOD">GOOD</option>
            <option value="NEEDS ATTENTION">NEEDS ATTENTION</option>
          </select>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="card empty-state">
          <h3>No Member Performance Records Found</h3>
          <p>
            {members.length === 0
              ? 'No member accounts registered yet.'
              : 'No members match the selected filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Team</th>
                  <th>LeetCode</th>
                  <th>Total Solved</th>
                  <th>Solved (Month)</th>
                  <th>Active Days</th>
                  <th>Inactive (Week)</th>
                  <th>Current Streak</th>
                  <th>Monthly Goal</th>
                  <th>Goal Progress</th>
                  <th>Last Activity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold">{m.name}</td>
                    <td>
                      <span className="user-profile-badge" style={{ fontSize: '0.78rem' }}>
                        {m.teamName}
                      </span>
                    </td>
                    <td>
                      {m.leetcodeUsername ? (
                        <span className="username-tag">@{m.leetcodeUsername}</span>
                      ) : (
                        <span className="not-connected-tag">Not connected</span>
                      )}
                    </td>
                    <td className="font-semibold">
                      <span className="highlight-total">{m.totalSolved}</span>
                    </td>
                    <td className="text-easy">{m.solvedThisMonth}</td>
                    <td>{m.activeDays} d</td>
                    <td className="text-hard">{m.inactiveDays ?? 0} d</td>
                    <td className="text-medium">🔥 {m.currentStreak} d</td>
                    <td>{m.monthlyGoal ? `${m.monthlyGoal} probs` : <span style={{ color: 'var(--muted)' }}>No Goal</span>}</td>
                    <td>
                      {m.monthlyGoalPct !== null ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${m.monthlyGoalPct}%`, height: '100%', backgroundColor: m.monthlyGoalPct >= 80 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{m.monthlyGoalPct}%</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="sync-time">{formatDate(m.lastActivity)}</td>
                    <td>{renderPerformanceBadge(m.performanceStatus)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/member-performance/${m.id}`}
                        style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMemberPerformance;
