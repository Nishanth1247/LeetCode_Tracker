import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getMyAnalytics,
  getTeamAnalytics,
  getMyDailyAnalytics,
  getMyWeekAnalytics,
  getAdminMemberDailyAnalytics,
  getTeamDailyAnalytics,
  getAdminUsers,
  getAllTeams,
} from '../services/api';
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

  // Active view tab (MEMBER view or ADMIN/LEADER view)
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'overview' | 'teamDaily' | 'adminMemberDaily'

  // General Overview State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Member Day-by-Day State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState('');

  // Member Week View State
  const [weekData, setWeekData] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);

  // Admin / Leader Team Daily State
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamDailyDate, setTeamDailyDate] = useState(todayStr);
  const [teamDailyData, setTeamDailyData] = useState(null);
  const [teamDailyLoading, setTeamDailyLoading] = useState(false);
  const [teamDailyError, setTeamDailyError] = useState('');

  // Admin Member Daily State
  const [adminMembers, setAdminMembers] = useState([]);
  const [selectedAdminMemberId, setSelectedAdminMemberId] = useState('');
  const [adminMemberDate, setAdminMemberDate] = useState(todayStr);
  const [adminMemberDailyData, setAdminMemberDailyData] = useState(null);
  const [adminMemberDailyLoading, setAdminMemberDailyLoading] = useState(false);
  const [adminMemberDailyError, setAdminMemberDailyError] = useState('');

  const chartColors = {
    easy: theme === 'dark' ? '#34d399' : '#059669',
    medium: theme === 'dark' ? '#fbbf24' : '#d97706',
    hard: theme === 'dark' ? '#f87171' : '#dc2626',
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    text: theme === 'dark' ? '#a3a3a3' : '#6b7280',
    grid: theme === 'dark' ? '#262626' : '#e5e7eb',
    cardBg: theme === 'dark' ? '#171717' : '#ffffff',
  };

  useEffect(() => {
    fetchOverview();
    if (!isAdmin) {
      fetchDailyData(selectedDate);
      fetchWeekData();
    } else {
      fetchAdminDataSources();
    }
  }, [isAdmin]);

  // Fetch standard overview
  const fetchOverview = async () => {
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
      setError(err.response?.data?.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  // Member Daily
  const fetchDailyData = async (dateStr) => {
    try {
      setDailyLoading(true);
      setDailyError('');
      const res = await getMyDailyAnalytics(dateStr);
      if (res.success) {
        setDailyData(res.data);
      }
    } catch (err) {
      console.error('Failed to load daily analytics:', err);
      setDailyError(err.response?.data?.message || 'Failed to load daily analytics.');
    } finally {
      setDailyLoading(false);
    }
  };

  // Member Week
  const fetchWeekData = async (startDateStr) => {
    try {
      setWeekLoading(true);
      const res = await getMyWeekAnalytics(startDateStr);
      if (res.success) {
        setWeekData(res.data);
      }
    } catch (err) {
      console.error('Failed to load week analytics:', err);
    } finally {
      setWeekLoading(false);
    }
  };

  // Admin Data Sources
  const fetchAdminDataSources = async () => {
    try {
      const [userRes, teamRes] = await Promise.all([
        getAdminUsers().catch(() => ({ success: false })),
        getAllTeams().catch(() => ({ success: false })),
      ]);

      if (userRes.success && userRes.data) {
        const membersOnly = userRes.data.filter((u) => u.role === 'MEMBER');
        setAdminMembers(membersOnly);
        if (membersOnly.length > 0) {
          setSelectedAdminMemberId(membersOnly[0].id);
          fetchAdminMemberDaily(membersOnly[0].id, adminMemberDate);
        }
      }

      if (teamRes.success && teamRes.data) {
        setTeams(teamRes.data);
        if (teamRes.data.length > 0) {
          setSelectedTeamId(teamRes.data[0].id);
          fetchTeamDaily(teamRes.data[0].id, teamDailyDate);
        }
      }
    } catch (err) {
      console.error('Error loading admin metadata:', err);
    }
  };

  // Admin Member Daily
  const fetchAdminMemberDaily = async (mId, dStr) => {
    if (!mId) return;
    try {
      setAdminMemberDailyLoading(true);
      setAdminMemberDailyError('');
      const res = await getAdminMemberDailyAnalytics(mId, dStr);
      if (res.success) {
        setAdminMemberDailyData(res.data);
      }
    } catch (err) {
      console.error('Admin Member Daily error:', err);
      setAdminMemberDailyError(err.response?.data?.message || 'Failed to load member daily analytics.');
    } finally {
      setAdminMemberDailyLoading(false);
    }
  };

  // Team Daily
  const fetchTeamDaily = async (tId, dStr) => {
    if (!tId) return;
    try {
      setTeamDailyLoading(true);
      setTeamDailyError('');
      const res = await getTeamDailyAnalytics(tId, dStr);
      if (res.success) {
        setTeamDailyData(res.data);
      }
    } catch (err) {
      console.error('Team Daily error:', err);
      setTeamDailyError(err.response?.data?.message || 'Failed to load team daily analytics.');
    } finally {
      setTeamDailyLoading(false);
    }
  };

  // Helper date manipulators
  const handleShiftDate = (days) => {
    const cur = new Date(selectedDate + 'T00:00:00Z');
    cur.setUTCDate(cur.getUTCDate() + days);
    const newDateStr = cur.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    fetchDailyData(newDateStr);
  };

  const handleSelectDate = (dStr) => {
    setSelectedDate(dStr);
    fetchDailyData(dStr);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00Z');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1>{isAdmin ? 'Analytics & Day-by-Day Activity' : 'Progress & Daily Analytics'}</h1>
          <p className="welcome-subtitle">
            {isAdmin
              ? 'Comprehensive team and member day-by-day LeetCode tracking'
              : 'Track your daily problem solving, difficulty breakdown, points, and weekly trends'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {!isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('daily')}
              className={`btn ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              📅 Daily Analytics
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              📊 Overall Trends
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('daily')}
              className={`btn ${activeTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              📅 Admin Member Daily
            </button>
            <button
              onClick={() => setActiveTab('teamDaily')}
              className={`btn ${activeTab === 'teamDaily' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              👥 Team Day-by-Day
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', width: 'auto' }}
            >
              📊 Aggregate Team Overview
            </button>
          </>
        )}
      </div>

      {/* ============================================================
          MEMBER VIEW: TAB 1 — DAY-BY-DAY ANALYTICS
         ============================================================ */}
      {!isAdmin && activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Date Selector Controls */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleShiftDate(-1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  ← Previous Day
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleSelectDate(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.75rem',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                />
                <button onClick={() => handleShiftDate(1)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  Next Day →
                </button>
                <button
                  onClick={() => handleSelectDate(todayStr)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  Today
                </button>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                {formatDateDisplay(selectedDate)}
              </div>
            </div>
          </div>

          {/* Member Week View Strip (Monday to Sunday) */}
          <div className="card">
            <div className="card-header">
              <h3>This Week Solved Activity (Mon – Sun)</h3>
            </div>
            <div className="card-body">
              {weekLoading ? (
                <p className="not-connected-tag">Loading week activity...</p>
              ) : weekData?.days ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {weekData.days.map((wd) => {
                    const isSelected = wd.date === selectedDate;
                    const isToday = wd.date === todayStr;
                    return (
                      <div
                        key={wd.date}
                        onClick={() => handleSelectDate(wd.date)}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : isToday
                            ? 'var(--surface-hover)'
                            : 'var(--surface)',
                          color: isSelected ? '#ffffff' : 'var(--text)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.75rem 0.4rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>
                          {wd.dayName}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>
                          {wd.dayNumber}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          {wd.solvedCount > 0 ? (
                            <span style={{ color: isSelected ? '#ffffff' : 'var(--status-easy)' }}>
                              {wd.solvedCount} solved
                            </span>
                          ) : (
                            <span style={{ opacity: 0.5 }}>0</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {/* Daily Summary Cards */}
          {dailyLoading ? (
            <div className="loading-container" style={{ padding: '2rem' }}>
              <div className="spinner"></div>
              <p>Fetching daily data for {selectedDate}...</p>
            </div>
          ) : dailyError ? (
            <div className="alert alert-error">{dailyError}</div>
          ) : dailyData ? (
            <>
              <div className="stats-grid" style={{ padding: 0 }}>
                <div className="stat-box">
                  <span className="stat-title">Problems Solved</span>
                  <span className="stat-number highlight-total">{dailyData.summary.problemsSolved}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Easy Solved</span>
                  <span className="stat-number text-easy">{dailyData.summary.easyCount}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>1 pt each</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Medium Solved</span>
                  <span className="stat-number text-medium">{dailyData.summary.mediumCount}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>2.5 pts each</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Hard Solved</span>
                  <span className="stat-number text-hard">{dailyData.summary.hardCount}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>5 pts each</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Total Points</span>
                  <span className="stat-number text-medium" style={{ color: '#9333ea' }}>
                    {dailyData.summary.totalPoints}
                  </span>
                </div>
              </div>

              {/* Solved Problems Table */}
              <div className="card">
                <div className="card-header">
                  <h3>Daily Solved Problems ({dailyData.submissions.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {dailyData.submissions.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                      <p className="welcome-subtitle">No problems solved on {selectedDate}.</p>
                      <span className="card-description">
                        Solve LeetCode problems today and click sync to log your activity.
                      </span>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Problem</th>
                            <th>Difficulty</th>
                            <th>Language</th>
                            <th>Solved At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyData.submissions.map((sub, idx) => (
                            <tr key={idx}>
                              <td className="font-semibold">
                                {sub.slug ? (
                                  <a
                                    href={`https://leetcode.com/problems/${sub.slug}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--primary)', textDecoration: 'none' }}
                                  >
                                    {sub.title}
                                  </a>
                                ) : (
                                  <span>{sub.title}</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{
                                    backgroundColor:
                                      sub.difficulty === 'EASY'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : sub.difficulty === 'MEDIUM'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                    color:
                                      sub.difficulty === 'EASY'
                                        ? 'var(--status-easy)'
                                        : sub.difficulty === 'MEDIUM'
                                        ? 'var(--status-medium)'
                                        : 'var(--status-hard)',
                                  }}
                                >
                                  {sub.difficulty}
                                </span>
                              </td>
                              <td>{sub.language}</td>
                              <td className="sync-time">
                                {new Date(sub.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================
          ADMIN VIEW: TAB 1 — ADMIN MEMBER DAILY
         ============================================================ */}
      {isAdmin && activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Member & Date Selection Controls */}
          <div className="card">
            <div className="card-header">
              <h3>Select Member & Date</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Member</label>
                <select
                  value={selectedAdminMemberId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    setSelectedAdminMemberId(mId);
                    fetchAdminMemberDaily(mId, adminMemberDate);
                  }}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                  }}
                >
                  {adminMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.leetcode_username ? `@${m.leetcode_username}` : 'No LC'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Date</label>
                <input
                  type="date"
                  value={adminMemberDate}
                  onChange={(e) => {
                    const dStr = e.target.value;
                    setAdminMemberDate(dStr);
                    fetchAdminMemberDaily(selectedAdminMemberId, dStr);
                  }}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>

          {adminMemberDailyLoading ? (
            <div className="loading-container" style={{ padding: '2rem' }}>
              <div className="spinner"></div>
              <p>Loading member daily data...</p>
            </div>
          ) : adminMemberDailyError ? (
            <div className="alert alert-error">{adminMemberDailyError}</div>
          ) : adminMemberDailyData ? (
            <>
              {/* Summary Cards */}
              <div className="stats-grid" style={{ padding: 0 }}>
                <div className="stat-box">
                  <span className="stat-title">Problems Solved</span>
                  <span className="stat-number highlight-total">{adminMemberDailyData.summary.problemsSolved}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Easy</span>
                  <span className="stat-number text-easy">{adminMemberDailyData.summary.easyCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Medium</span>
                  <span className="stat-number text-medium">{adminMemberDailyData.summary.mediumCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Hard</span>
                  <span className="stat-number text-hard">{adminMemberDailyData.summary.hardCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Total Points</span>
                  <span className="stat-number text-medium" style={{ color: '#9333ea' }}>
                    {adminMemberDailyData.summary.totalPoints}
                  </span>
                </div>
              </div>

              {/* Member Submissions Table */}
              <div className="card">
                <div className="card-header">
                  <h3>
                    Submissions for {adminMemberDailyData.member.name} on {adminMemberDailyData.date} ({adminMemberDailyData.submissions.length})
                  </h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {adminMemberDailyData.submissions.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <p>No submissions recorded for this member on {adminMemberDailyData.date}.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Problem Title</th>
                            <th>Difficulty</th>
                            <th>Language</th>
                            <th>Solved At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminMemberDailyData.submissions.map((sub, idx) => (
                            <tr key={idx}>
                              <td className="font-semibold">{sub.title}</td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{
                                    backgroundColor:
                                      sub.difficulty === 'EASY'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : sub.difficulty === 'MEDIUM'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)',
                                    color:
                                      sub.difficulty === 'EASY'
                                        ? 'var(--status-easy)'
                                        : sub.difficulty === 'MEDIUM'
                                        ? 'var(--status-medium)'
                                        : 'var(--status-hard)',
                                  }}
                                >
                                  {sub.difficulty}
                                </span>
                              </td>
                              <td>{sub.language}</td>
                              <td className="sync-time">
                                {new Date(sub.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================
          ADMIN / TEAM LEADER: TAB 2 — TEAM DAY-BY-DAY
         ============================================================ */}
      {isAdmin && activeTab === 'teamDaily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Team & Date Selection */}
          <div className="card">
            <div className="card-header">
              <h3>Select Team & Date</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => {
                    const tId = e.target.value;
                    setSelectedTeamId(tId);
                    fetchTeamDaily(tId, teamDailyDate);
                  }}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Date</label>
                <input
                  type="date"
                  value={teamDailyDate}
                  onChange={(e) => {
                    const dStr = e.target.value;
                    setTeamDailyDate(dStr);
                    fetchTeamDaily(selectedTeamId, dStr);
                  }}
                  style={{
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>

          {teamDailyLoading ? (
            <div className="loading-container" style={{ padding: '2rem' }}>
              <div className="spinner"></div>
              <p>Loading team daily activity...</p>
            </div>
          ) : teamDailyError ? (
            <div className="alert alert-error">{teamDailyError}</div>
          ) : teamDailyData ? (
            <>
              {/* Team Summary Cards */}
              <div className="stats-grid" style={{ padding: 0 }}>
                <div className="stat-box">
                  <span className="stat-title">Team Total Solved</span>
                  <span className="stat-number highlight-total">{teamDailyData.summary.teamTotalSolved}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Easy</span>
                  <span className="stat-number text-easy">{teamDailyData.summary.teamEasyCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Medium</span>
                  <span className="stat-number text-medium">{teamDailyData.summary.teamMediumCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Hard</span>
                  <span className="stat-number text-hard">{teamDailyData.summary.teamHardCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-title">Team Points</span>
                  <span className="stat-number text-medium" style={{ color: '#9333ea' }}>
                    {teamDailyData.summary.teamTotalPoints}
                  </span>
                </div>
              </div>

              {/* Member Contribution Breakdown Table */}
              <div className="card">
                <div className="card-header">
                  <h3>
                    Member Contribution for {teamDailyData.team.name} on {teamDailyData.date}
                  </h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {teamDailyData.memberBreakdown.length === 0 ? (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <p>No members in this team.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Member</th>
                            <th>LeetCode</th>
                            <th>Solved</th>
                            <th>Easy</th>
                            <th>Medium</th>
                            <th>Hard</th>
                            <th>Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamDailyData.memberBreakdown.map((mb) => (
                            <tr key={mb.id}>
                              <td className="font-semibold">{mb.name}</td>
                              <td>
                                {mb.username ? (
                                  <span className="username-tag">@{mb.username}</span>
                                ) : (
                                  <span className="not-connected-tag">N/A</span>
                                )}
                              </td>
                              <td className="font-bold">{mb.problemsSolved}</td>
                              <td className="text-easy">{mb.easyCount}</td>
                              <td className="text-medium">{mb.mediumCount}</td>
                              <td className="text-hard">{mb.hardCount}</td>
                              <td className="font-bold" style={{ color: '#9333ea' }}>
                                {mb.totalPoints}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ============================================================
          OVERVIEW TAB (MEMBER & ADMIN AGGREGATE CHARTS)
         ============================================================ */}
      {activeTab === 'overview' && (
        <>
          {/* MEMBER OVERVIEW */}
          {!isAdmin ? (
            (() => {
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
                date: new Date(h.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                total: h.totalSolved,
                easy: h.easySolved,
                medium: h.mediumSolved,
                hard: h.hardSolved,
              }));

              return (
                <div>
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
            })()
          ) : (
            /* ADMIN OVERVIEW */
            (() => {
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
                <div>
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
            })()
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;

