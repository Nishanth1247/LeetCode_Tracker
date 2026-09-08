import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMyAnalytics, getTeamAnalytics } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const Analytics = () => {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      if (isAdmin) {
        const res = await getTeamAnalytics();
        if (res.success) setData(res.data);
      } else {
        const res = await getMyAnalytics();
        if (res.success) setData(res.data);
      }
    } catch (err) {
      console.error('Analytics load error:', err);
      const msg = isAdmin
        ? 'Unable to load team analytics.'
        : 'Unable to load analytics.';
      setError(err.response?.data?.message || msg);
    } finally {
      setLoading(false);
    }
  };

  const chartColors = {
    easy: theme === 'dark' ? '#34d399' : '#059669',
    medium: theme === 'dark' ? '#fbbf24' : '#d97706',
    hard: theme === 'dark' ? '#f87171' : '#dc2626',
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    text: theme === 'dark' ? '#a3a3a3' : '#6b7280',
    grid: theme === 'dark' ? '#262626' : '#e5e7eb',
    cardBg: theme === 'dark' ? '#171717' : '#ffffff',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{isAdmin ? 'Loading team analytics...' : 'Loading analytics...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Analytics</h1>
        </div>
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  // MEMBER ANALYTICS VIEW
  if (!isAdmin) {
    const current = data?.currentStats || {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
    };

    const difficultyData = [
      { name: 'Easy', count: current.easySolved, color: chartColors.easy },
      { name: 'Medium', count: current.mediumSolved, color: chartColors.medium },
      { name: 'Hard', count: current.hardSolved, color: chartColors.hard },
    ];

    const historyData = (data?.history || []).map((h) => ({
      date: formatDate(h.recordedAt),
      total: h.totalSolved,
      easy: h.easySolved,
      medium: h.mediumSolved,
      hard: h.hardSolved,
    }));

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Progress Analytics</h1>
          <p className="welcome-subtitle">Individual LeetCode problem solving progress & trends</p>
        </div>

        {/* Overview Stat Cards */}
        <div className="stats-grid" style={{ padding: 0 }}>
          <div className="stat-box">
            <span className="stat-title">Total Solved</span>
            <span className="stat-number highlight-total">{current.totalSolved}</span>
          </div>
          <div className="stat-box">
            <span className="stat-title">Easy</span>
            <span className="stat-number text-easy">{current.easySolved}</span>
          </div>
          <div className="stat-box">
            <span className="stat-title">Medium</span>
            <span className="stat-number text-medium">{current.mediumSolved}</span>
          </div>
          <div className="stat-box">
            <span className="stat-title">Hard</span>
            <span className="stat-number text-hard">{current.hardSolved}</span>
          </div>
        </div>

        <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
          {/* Difficulty Distribution Chart */}
          <div className="card">
            <div className="card-header">
              <h3>Difficulty Breakdown</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="name" stroke={chartColors.text} />
                  <YAxis stroke={chartColors.text} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.cardBg,
                      borderColor: chartColors.grid,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Over Time Chart */}
          <div className="card">
            <div className="card-header">
              <h3>Progress Over Time</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              {historyData.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <p>No historical progress data yet.</p>
                  <span className="card-description">
                    Progress history is recorded automatically whenever you sync your LeetCode profile.
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="date" stroke={chartColors.text} />
                    <YAxis stroke={chartColors.text} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.cardBg,
                        borderColor: chartColors.grid,
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total Solved"
                      stroke={chartColors.primary}
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN ANALYTICS VIEW
  const teamDifficultyData = [
    { name: 'Easy', count: data?.easySolved || 0, color: chartColors.easy },
    { name: 'Medium', count: data?.mediumSolved || 0, color: chartColors.medium },
    { name: 'Hard', count: data?.hardSolved || 0, color: chartColors.hard },
  ];

  const memberComparisonData = (data?.members || []).map((m) => ({
    name: m.name,
    username: m.username,
    solved: m.totalSolved,
  }));

  const teamHistoryData = (data?.history || []).map((h) => ({
    date: h.date,
    total: h.totalSolved,
  }));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Team Analytics Overview</h1>
        <p className="welcome-subtitle">Aggregated progress metrics across connected team members</p>
      </div>

      {/* Team Overview Cards */}
      <div className="stats-grid" style={{ padding: 0 }}>
        <div className="stat-box">
          <span className="stat-title">Connected Members</span>
          <span className="stat-number highlight-total">{data?.connectedMembers || 0}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Total Solved</span>
          <span className="stat-number highlight-total">{data?.totalSolved || 0}</span>
        </div>
        <div className="stat-box">
          <span className="stat-title">Average Solved / Member</span>
          <span className="stat-number text-medium">{data?.averageSolved || 0}</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
        {/* Team Difficulty Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Team Difficulty Breakdown</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamDifficultyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.cardBg,
                    borderColor: chartColors.grid,
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {teamDifficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Comparison */}
        <div className="card">
          <div className="card-header">
            <h3>Member Solved Comparison</h3>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {memberComparisonData.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No connected team members yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="name" stroke={chartColors.text} />
                  <YAxis stroke={chartColors.text} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.cardBg,
                      borderColor: chartColors.grid,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="solved" name="Total Solved" fill={chartColors.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Team Progress Over Time */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <h3>Team Historical Progress</h3>
        </div>
        <div className="card-body" style={{ height: '300px' }}>
          {teamHistoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Not enough historical data yet.</p>
              <span className="card-description">
                Team progress history will accumulate as members synchronize their profiles over time.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamHistoryData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.cardBg,
                    borderColor: chartColors.grid,
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Team Total Solved"
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
