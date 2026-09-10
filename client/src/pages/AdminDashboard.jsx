import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getAllTeams, getAllChallenges, getChallengeProgress } from '../services/api';

const AdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [teamsCount, setTeamsCount] = useState(0);
  const [activeChallengesCount, setActiveChallengesCount] = useState(0);
  const [completedChallengesCount, setCompletedChallengesCount] = useState(0);
  const [teamsList, setTeamsList] = useState([]);
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

      const allChallenges = (challengesRes && challengesRes.success) ? (challengesRes.data || []) : [];

      if (challengesRes && challengesRes.success) {
        const active = allChallenges.filter((c) => c.status === 'ACTIVE').length;
        const completed = allChallenges.filter((c) => c.status === 'COMPLETED').length;
        setActiveChallengesCount(active);
        setCompletedChallengesCount(completed);
      }

      if (teamsRes && teamsRes.success) {
        const rawTeams = teamsRes.data || [];
        setTeamsCount(rawTeams.length);

        // Fetch challenge progress for active team challenges to compute aggregate team progress
        const activeChallenges = allChallenges.filter((c) => c.status === 'ACTIVE');
        const progressPromises = activeChallenges.map((c) =>
          getChallengeProgress(c.id).catch(() => null)
        );
        const progressResults = await Promise.all(progressPromises);
        const validProgress = progressResults.filter((r) => r && r.success).map((r) => r.data);

        // Map teams with progress metrics
        const teamsProgressList = rawTeams.map((t) => {
          const teamActiveChallenges = activeChallenges.filter((c) => c.teamId === t.id);
          const teamCompletedChallenges = allChallenges.filter((c) => c.teamId === t.id && c.status === 'COMPLETED');
          
          let totalTarget = 0;
          let totalSolved = 0;

          teamActiveChallenges.forEach((c) => {
            const prog = validProgress.find((p) => p.challenge && p.challenge.id === c.id);
            if (prog && prog.progress) {
              totalTarget += prog.progress.target || 0;
              totalSolved += prog.progress.solved || 0;
            } else {
              totalTarget += c.target || 0;
            }
          });

          const remaining = Math.max(0, totalTarget - totalSolved);
          const percentage = totalTarget > 0 ? Math.min(100, Math.round((totalSolved / totalTarget) * 100)) : 0;

          return {
            id: t.id,
            name: t.name,
            memberCount: t.memberCount,
            activeChallengeCount: teamActiveChallenges.length,
            completedChallengeCount: teamCompletedChallenges.length,
            target: totalTarget,
            solved: totalSolved,
            remaining,
            percentage,
          };
        });

        setTeamsList(teamsProgressList);
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

      {/* V8.3 Team Completion Progress Section */}
      {teamsList.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>Team Progress Overview</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {teamsList.map((t) => {
                const hasActive = t.activeChallengeCount > 0;
                return (
                  <div
                    key={t.id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Link to={`/admin/teams/${t.id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', textDecoration: 'none' }}>
                        {t.name}
                      </Link>
                      <span className="user-profile-badge" style={{ fontSize: '0.75rem' }}>
                        {t.memberCount} Members
                      </span>
                    </div>

                    {hasActive ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                          <span>Overall Progress</span>
                          <span>
                            {t.solved} / {t.target} ({t.percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                          <div style={{ width: `${t.percentage}%`, height: '100%', backgroundColor: t.percentage === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)' }}>
                          <span>Remaining: {t.remaining}</span>
                          <span>
                            Challenges: {t.activeChallengeCount} Active | {t.completedChallengeCount} Completed
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                        No active challenges
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
