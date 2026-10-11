import React, { useState, useEffect } from 'react';
import { getAdminRepeatSolves, getAllTeams } from '../services/api';

const RepeatSolves = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Filters state
  const [search, setSearch] = useState('');
  const [teamId, setTeamId] = useState('');
  const [difficulty, setDifficulty] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('latestSolve');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchRepeatSolves();
  }, [teamId, difficulty, startDate, endDate, sortBy, sortOrder, page]);

  const fetchTeams = async () => {
    try {
      const res = await getAllTeams();
      if (res.success && res.data) {
        setTeams(res.data);
      }
    } catch (err) {
      console.error('Fetch teams error:', err);
    }
  };

  const fetchRepeatSolves = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 25,
        sortBy,
        sortOrder,
      };
      if (search.trim()) params.search = search.trim();
      if (teamId) params.teamId = teamId;
      if (difficulty !== 'ALL') params.difficulty = difficulty;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getAdminRepeatSolves(params);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load repeat solves.');
      }
    } catch (err) {
      console.error('getAdminRepeatSolves error:', err);
      setError(err.response?.data?.message || 'Error fetching repeat solves data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRepeatSolves();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTeamId('');
    setDifficulty('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('latestSolve');
    setSortOrder('DESC');
    setPage(1);
  };

  const toggleRowExpand = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatDateTimeIST = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const summary = data?.summary || {
    totalRepeatInstances: 0,
    membersWithRepeats: 0,
    totalExtraRepeats: 0,
    mostRepeatedProblem: null,
  };

  const items = data?.items || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
          Repeat Solves Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          Audit accepted submissions where members solved the same problem at distinct timestamps.
        </p>
      </div>

      {/* Explanatory Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          padding: '1rem 1.25rem',
          borderLeft: '4px solid #3b82f6',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>ℹ️</span>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
              Audit & Verification Notice
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Repeat solves commonly occur during spaced revision, practicing in different programming languages, or streak maintenance.
              The system does not classify a member as cheating based solely on repeat solves. Note that LeetCode public API provides up to 20 recent submissions per user; historical solves prior to tracking are unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Repeat Problem Instances
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '0.25rem', color: '#3b82f6' }}>
            {summary.totalRepeatInstances}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Unique (User + Problem) pairs</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Members with Repeats
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '0.25rem', color: '#8b5cf6' }}>
            {summary.membersWithRepeats}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Distinct registered members</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Total Repeat Solves
          </span>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, marginTop: '0.25rem', color: '#f59e0b' }}>
            {summary.totalExtraRepeats}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Submissions beyond first solve</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Top Repeated Problem
          </span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {summary.mostRepeatedProblem?.title || 'None yet'}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            {summary.mostRepeatedProblem
              ? `${summary.mostRepeatedProblem.repeats} repeat solves across ${summary.mostRepeatedProblem.usersCount} member(s)`
              : 'No repeated solves found'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Search Member / Problem
              </label>
              <input
                type="text"
                placeholder="Name, @username, or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Team Filter
              </label>
              <select
                value={teamId}
                onChange={(e) => {
                  setTeamId(e.target.value);
                  setPage(1);
                }}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="latestSolve">Latest Repeat Time</option>
                <option value="repeatCount">Repeat Count</option>
                <option value="earliestSolve">Earliest Solve Time</option>
                <option value="name">Member Name</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.88rem', flex: 1 }}
              >
                Search
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading repeat solves data...</p>
        </div>
      ) : error ? (
        <div className="card alert alert-danger" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3>Error Loading Repeat Solves</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchRepeatSolves} style={{ marginTop: '0.75rem', maxWidth: '150px' }}>
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Repeat Solves Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto' }}>
            No recorded accepted submissions match the selected filters where a member solved the same problem more than once.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Member</th>
                <th style={{ padding: '0.75rem' }}>Team</th>
                <th style={{ padding: '0.75rem' }}>Problem</th>
                <th style={{ padding: '0.75rem' }}>Difficulty</th>
                <th style={{ padding: '0.75rem' }}>Languages</th>
                <th style={{ padding: '0.75rem' }}>Earliest Solve (IST)</th>
                <th style={{ padding: '0.75rem' }}>Latest Repeat (IST)</th>
                <th style={{ padding: '0.75rem' }}>Solves Count</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const rowKey = `${row.userId}-${row.problemSlug}`;
                const isExpanded = !!expandedRows[rowKey];

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: isExpanded ? 'var(--bg-secondary)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>
                        <div>{row.memberName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                          @{row.leetcodeUsername || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {row.teamName}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <a
                          href={`https://leetcode.com/problems/${row.problemSlug}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {row.problemTitle} ↗
                        </a>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{row.problemSlug}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor:
                              row.difficulty === 'EASY'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : row.difficulty === 'MEDIUM'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              row.difficulty === 'EASY'
                                ? 'var(--status-easy)'
                                : row.difficulty === 'MEDIUM'
                                ? 'var(--status-medium)'
                                : 'var(--status-hard)',
                          }}
                        >
                          {row.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem' }}>
                        {row.languages.length > 0 ? row.languages.join(', ') : 'Unknown'}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {formatDateTimeIST(row.earliestSolve)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                        {formatDateTimeIST(row.latestSolve)}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: 'var(--status-medium)',
                          }}
                        >
                          {row.totalSolvesCount} solves (+{row.repeatCount} repeat{row.repeatCount > 1 ? 's' : ''})
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => toggleRowExpand(rowKey)}
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.65rem',
                            width: 'auto',
                            cursor: 'pointer',
                          }}
                        >
                          {isExpanded ? 'Hide History ▲' : 'View History ▼'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Solves Timeline Row */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <td colSpan={9} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                          <div style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '0.88rem' }}>
                            Submission Timeline for "{row.problemTitle}" by {row.memberName}:
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', maxWidth: '750px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                                <th style={{ padding: '0.4rem 0.5rem' }}>Solve #</th>
                                <th style={{ padding: '0.4rem 0.5rem' }}>Classification</th>
                                <th style={{ padding: '0.4rem 0.5rem' }}>Accepted Timestamp (IST)</th>
                                <th style={{ padding: '0.4rem 0.5rem' }}>Language</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.solvesHistory.map((h) => (
                                <tr key={h.solveNumber} style={{ borderBottom: '1px dashed var(--border)' }}>
                                  <td style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>#{h.solveNumber}</td>
                                  <td style={{ padding: '0.4rem 0.5rem' }}>
                                    {h.isFirstSolve ? (
                                      <span style={{ color: 'var(--status-easy)', fontWeight: 600 }}>Initial Solve</span>
                                    ) : (
                                      <span style={{ color: 'var(--status-medium)', fontWeight: 600 }}>
                                        Repeat #{h.solveNumber - 1}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '0.4rem 0.5rem' }}>{formatDateTimeIST(h.solvedAt)}</td>
                                  <td style={{ padding: '0.4rem 0.5rem' }}>{h.language}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total repeat problems)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                >
                  ← Previous
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepeatSolves;
