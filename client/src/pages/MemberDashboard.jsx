import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyLeetCodeStats,
  connectLeetCode,
  getMyActivity,
  getMyGoals,
  updateMyGoals,
  getMyPerformanceSummary,
  getMyChallenges,
  getChallengeProgress,
  getPracticeSuggestions,
  getMyRoadmapProgress,
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

  // Practice Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsReason, setSuggestionsReason] = useState(null);
  const [suggestionsError, setSuggestionsError] = useState('');

  // Goals & Performance Summary state
  const [goalsData, setGoalsData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [monthlyInput, setMonthlyInput] = useState('30');
  const [dailyInput, setDailyInput] = useState('1');
  const [savingGoals, setSavingGoals] = useState(false);

  // Sync Notice Modal state
  const [showSyncNoticeModal, setShowSyncNoticeModal] = useState(false);

  // Today's Focus Tasks state
  const [todaysFocusTeamTasks, setTodaysFocusTeamTasks] = useState([]);
  const [todaysFocusIndividualTasks, setTodaysFocusIndividualTasks] = useState([]);
  const [isLeaderUser, setIsLeaderUser] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  // DSA Journey Roadmap state (V14.2)
  const [roadmapInfo, setRoadmapInfo] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const navigate = useNavigate();

  // Handle ESC key for Sync Notice modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showSyncNoticeModal) {
        setShowSyncNoticeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSyncNoticeModal]);

  useEffect(() => {
    fetchStats();
    fetchGoalsAndPerformance();
    fetchTodaysFocus();
    fetchSuggestions();
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    try {
      setRoadmapLoading(true);
      const res = await getMyRoadmapProgress();
      if (res.success && res.data) {
        // Compute next incomplete problem inside current topic
        let nextProb = null;
        const currentTId = res.data.currentTopic?.id;
        if (currentTId && res.data.stages) {
          for (const stage of res.data.stages) {
            for (const topic of stage.topics) {
              if (topic.id === currentTId) {
                nextProb = topic.problems.find((p) => !p.completed) || null;
                break;
              }
            }
          }
        }
        setRoadmapInfo({
          ...res.data,
          nextProblem: nextProb,
        });
      }
    } catch (err) {
      console.error('Error loading roadmap data:', err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      setSuggestionsError('');
      const res = await getPracticeSuggestions();
      if (res.success && res.data) {
        setSuggestions(res.data.suggestions || []);
        setSuggestionsReason(res.data.reason || null);
      }
    } catch (err) {
      console.error('Failed to load practice suggestions:', err);
      setSuggestionsError('Unable to load practice suggestions.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchTodaysFocus = async () => {
    try {
      setTasksLoading(true);
      const res = await getMyChallenges();
      if (res.success && res.data) {
        setIsLeaderUser(Boolean(res.data.isLeader));
        const rawTeam = (res.data.teamTasks || []).filter((t) => t.status === 'ACTIVE');
        const rawInd = (res.data.individualTasks || []).filter((t) => t.status === 'ACTIVE');

        const teamPromises = rawTeam.map((t) => getChallengeProgress(t.id).catch(() => null));
        const indPromises = rawInd.map((t) => getChallengeProgress(t.id).catch(() => null));

        const teamResults = await Promise.all(teamPromises);
        const indResults = await Promise.all(indPromises);

        setTodaysFocusTeamTasks(teamResults.filter((r) => r && r.success).map((r) => r.data));
        setTodaysFocusIndividualTasks(indResults.filter((r) => r && r.success).map((r) => r.data));
      }
    } catch (err) {
      console.error('Error loading today focus tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchGoalsAndPerformance = async () => {
    try {
      const [goalsRes, perfRes] = await Promise.all([
        getMyGoals().catch(() => null),
        getMyPerformanceSummary().catch(() => null),
      ]);

      if (goalsRes && goalsRes.success) {
        setGoalsData(goalsRes.data);
        if (goalsRes.data.monthlyGoal) setMonthlyInput(String(goalsRes.data.monthlyGoal));
        if (goalsRes.data.dailyGoal) setDailyInput(String(goalsRes.data.dailyGoal));
      }

      if (perfRes && perfRes.success) {
        setPerformanceData(perfRes.data);
      }
    } catch (err) {
      console.error('Error loading goals and performance:', err);
    }
  };

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    try {
      setSavingGoals(true);
      setError('');
      const res = await updateMyGoals({
        monthlyProblemGoal: parseInt(monthlyInput, 10),
        dailyProblemGoal: parseInt(dailyInput, 10),
      });

      if (res.success) {
        setSuccessMsg('Personal goals updated successfully!');
        setShowGoalModal(false);
        fetchGoalsAndPerformance();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update goals.');
    } finally {
      setSavingGoals(false);
    }
  };

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

      {/* Automatic Sync Notice Banner */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>LeetCode Sync Updates</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>• Statistics are updated automatically in the background (~hourly).</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowSyncNoticeModal(true)}
          style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
        >
          View Details
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading LeetCode profile...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ============================================================
              SECTION 1: TODAY'S FOCUS (PROMINENT AT TOP)
             ============================================================ */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Today's Focus
              </h2>
              <p className="welcome-subtitle" style={{ marginTop: '0.2rem' }}>
                Your active target tasks for today
              </p>
            </div>
            <div className="card-body">
              {tasksLoading ? (
                <p className="not-connected-tag">Loading your active tasks...</p>
              ) : todaysFocusIndividualTasks.length === 0 && todaysFocusTeamTasks.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <p className="welcome-subtitle">No active tasks for today.</p>
                  <span className="card-description">
                    When your Team Leader or Admin assigns tasks, they will appear here.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Individual Tasks */}
                  {todaysFocusIndividualTasks.map(({ challenge, progress, membersProgress }) => {
                    const solved = progress.solved || 0;
                    const target = challenge.target || 1;
                    const remaining = Math.max(0, target - solved);
                    const pct = Math.min(100, Math.round((solved / target) * 100));

                    const assignedName = challenge.assignedToName || (membersProgress && membersProgress[0] ? membersProgress[0].name : null);
                    const isSelfAssigned = challenge.assignedTo === user?.id;

                    const badgeLabel = isLeaderUser
                      ? (assignedName && !isSelfAssigned ? `${assignedName.toUpperCase()}'S TASK` : "ASSIGNED MEMBER'S TASK")
                      : "MY INDIVIDUAL TASK";

                    return (
                      <div
                        key={challenge.id}
                        style={{
                          backgroundColor: 'var(--surface-hover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <span className="status-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#9333ea', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            {badgeLabel}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            Due: {new Date(challenge.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>{challenge.title}</h4>
                        {isLeaderUser && assignedName && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                            Assigned To: <span style={{ color: 'var(--text)' }}>{assignedName}</span>
                          </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                          <span>Target: <strong style={{ color: 'var(--text)' }}>{target}</strong></span>
                          <span>Solved: <strong style={{ color: 'var(--status-easy)' }}>{solved}</strong></span>
                          <span>Remaining: <strong style={{ color: 'var(--text)' }}>{remaining}</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.3rem' }}>
                          <span>Progress</span>
                          <span>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Team Task (Own Contribution Only) */}
                  {todaysFocusTeamTasks.map(({ challenge, membersProgress }) => {
                    const myProg = membersProgress && membersProgress.length > 0 ? membersProgress[0] : null;
                    const mySolved = myProg ? myProg.solved : 0;
                    const myPct = myProg ? myProg.percentage : Math.min(100, Math.round((mySolved / challenge.target) * 100));

                    return (
                      <div
                        key={challenge.id}
                        style={{
                          backgroundColor: 'var(--surface-hover)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            TEAM TASK
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                            Due: {new Date(challenge.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.1rem' }}>{challenge.title}</h4>
                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                          Team: {challenge.teamName} (Target: {challenge.target})
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                          <span>My Contribution: <strong style={{ color: 'var(--text)' }}>{mySolved}</strong></span>
                          <span>My Progress: <strong style={{ color: 'var(--primary)' }}>{myPct}%</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${myPct}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              DSA JOURNEY (V14.2 MEMBER ROADMAP)
             ============================================================ */}
          {roadmapInfo && (
            <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                    DSA Journey
                  </h2>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>
                    {roadmapInfo.overall.completed} / {roadmapInfo.overall.total} problems ({roadmapInfo.overall.percentage}%)
                  </span>
                </div>
                <p className="welcome-subtitle" style={{ marginTop: '0.2rem' }}>
                  Your continuous learning roadmap from beginner to interview-ready.
                </p>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                      Current Topic: {roadmapInfo.currentTopic?.title || 'Arrays'}
                    </span>
                    {roadmapInfo.nextProblem ? (
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text)' }}>
                        Next Problem: {roadmapInfo.nextProblem.title} ({roadmapInfo.nextProblem.difficulty})
                      </h4>
                    ) : (
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#059669' }}>
                        All topic problems completed!
                      </h4>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Topic Progress: {roadmapInfo.currentTopic?.completed || 0} / {roadmapInfo.currentTopic?.total || 0} problems
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {roadmapInfo.nextProblem ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/member/roadmap/problem/${roadmapInfo.nextProblem.slug}`)}
                        style={{ fontWeight: 600, padding: '0.55rem 1.1rem', cursor: 'pointer' }}
                      >
                        Continue Practice
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/member/roadmap')}
                        style={{ fontWeight: 600, padding: '0.55rem 1.1rem', cursor: 'pointer' }}
                      >
                        Continue Journey
                      </button>
                    )}
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate('/member/roadmap')}
                      style={{ fontWeight: 600, padding: '0.55rem 1.1rem', cursor: 'pointer' }}
                    >
                      View Journey
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              PRACTICE SUGGESTIONS (FOR MEMBERS)
             ============================================================ */}
          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                Practice Suggestions
              </h2>
              <p className="welcome-subtitle" style={{ marginTop: '0.2rem' }}>
                Problems similar to what you've recently solved.
              </p>
            </div>
            <div className="card-body">
              {suggestionsLoading ? (
                <p className="not-connected-tag">Finding problems to practice...</p>
              ) : suggestionsError ? (
                <div className="alert alert-error" style={{ margin: 0 }}>
                  <span>{suggestionsError}</span>
                </div>
              ) : suggestionsReason === 'NO_SOLVED_HISTORY' ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <p className="welcome-subtitle" style={{ fontWeight: 600 }}>Solve a few LeetCode problems first.</p>
                  <span className="card-description">
                    We'll use your solved problems to suggest what to practice next.
                  </span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                  <p className="welcome-subtitle" style={{ fontWeight: 600 }}>No new similar problems found yet.</p>
                  <span className="card-description">
                    Keep solving problems and we'll suggest more.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {suggestions.map((item) => (
                    <div
                      key={item.slug}
                      style={{
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                item.difficulty === 'EASY'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.difficulty === 'MEDIUM'
                                  ? 'rgba(245, 158, 11, 0.15)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              color:
                                item.difficulty === 'EASY'
                                  ? 'var(--status-easy)'
                                  : item.difficulty === 'MEDIUM'
                                  ? 'var(--status-medium)'
                                  : 'var(--status-hard)',
                              fontSize: '0.7rem',
                            }}
                          >
                            {item.difficulty}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>
                          {item.tags.join(' • ')}
                        </p>

                        {item.similarTo && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.85rem' }}>
                            Similar to: <strong>{item.similarTo.title}</strong>
                          </p>
                        )}
                      </div>

                      <a
                        href={item.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                          textDecoration: 'none',
                          textAlign: 'center',
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          display: 'block',
                          width: '100%',
                        }}
                      >
                        Practice Problem
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              SECTION 2: USER PROFILE & LEETCODE PROFILE
             ============================================================ */}
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

          {/* ============================================================
              SECTION 3: GOALS & PERFORMANCE SUMMARY
             ============================================================ */}
          {statsData?.username && (
            <div className="dashboard-grid">
              {/* 1. My Personal Goals Card */}
              <div className="card">
                <div className="card-header dashboard-header-flex">
                  <h3>My Personal Goals</h3>
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                  >
                    {goalsData?.hasGoal ? 'Edit Goals' : 'Set Your Goals'}
                  </button>
                </div>
                <div className="card-body">
                  {!goalsData?.hasGoal ? (
                    <div className="empty-state" style={{ padding: '1rem' }}>
                      <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No goals configured yet.</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                        Set your monthly and daily target problems to track your progress.
                      </p>
                      <button
                        onClick={() => setShowGoalModal(true)}
                        className="btn btn-primary"
                        style={{ width: 'auto', fontSize: '0.85rem' }}
                      >
                        Set Your Goals Now
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Monthly Goal Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Monthly Goal</span>
                          <span className="status-badge" style={{
                            backgroundColor: goalsData.monthlyStatus === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : goalsData.monthlyStatus === 'ON TRACK' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: goalsData.monthlyStatus === 'COMPLETED' ? 'var(--status-easy)' : goalsData.monthlyStatus === 'ON TRACK' ? 'var(--primary)' : 'var(--status-hard)'
                          }}>
                            {goalsData.monthlyStatus}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
                          <span>Progress: <strong>{goalsData.monthlySolved} / {goalsData.monthlyGoal}</strong> solved</span>
                          <span><strong>{goalsData.monthlyPercentage}%</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${goalsData.monthlyPercentage}%`, height: '100%', backgroundColor: goalsData.monthlyPercentage === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                          {goalsData.monthlyRemaining === 0 ? 'Monthly goal completed!' : `${goalsData.monthlyRemaining} problems remaining this month`}
                        </span>
                      </div>

                      {/* Daily Goal Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Daily Target (Today)</span>
                          <span className="status-badge" style={{
                            backgroundColor: goalsData.dailyStatus === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: goalsData.dailyStatus === 'COMPLETED' ? 'var(--status-easy)' : 'var(--status-medium)'
                          }}>
                            {goalsData.dailyStatus}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
                          <span>Today: <strong>{goalsData.dailySolved} / {goalsData.dailyGoal}</strong> solved</span>
                          <span><strong>{goalsData.dailyPercentage}%</strong></span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${goalsData.dailyPercentage}%`, height: '100%', backgroundColor: goalsData.dailyPercentage === 100 ? 'var(--status-easy)' : 'var(--status-medium)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
                          {goalsData.dailyRemaining === 0 ? 'Goal completed today!' : `${goalsData.dailyRemaining} more problem required today`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Performance Summary Card */}
              <div className="card">
                <div className="card-header">
                  <h3>Performance Summary</h3>
                </div>
                <div className="card-body">
                  {!performanceData ? (
                    <div className="empty-state" style={{ padding: '1rem' }}>
                      <p>Loading performance summary...</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      <div className="stat-box">
                        <span className="stat-title">Total Solved</span>
                        <span className="stat-number highlight-total">{performanceData.totalSolved}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">This Month</span>
                        <span className="stat-number text-easy">{performanceData.solvedThisMonth}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">This Week (7 Days)</span>
                        <span className="stat-number text-medium">{performanceData.solvedThisWeek}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">Current Streak</span>
                        <span className="stat-number text-easy">{performanceData.currentStreak} days</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">Longest Streak</span>
                        <span className="stat-number text-easy">{performanceData.longestStreak} days</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">Inactive (This Week)</span>
                        <span className="stat-number text-hard">{performanceData.inactiveDays ?? 0} {performanceData.inactiveDays === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-title">Active Days (Month)</span>
                        <span className="stat-number highlight-total">{performanceData.activeDaysThisMonth} days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              SECTION 4: RECENT ACTIVITY
             ============================================================ */}
          {statsData?.username && (
            <div className="card activity-section-card">
              <div className="card-header dashboard-header-flex">
                <h3>Recent LeetCode Activity</h3>
                {activityData && getStatusBadge(activityData.status)}
              </div>
              <div className="card-body">
                {activityError && (
                  <div className="alert alert-error">
                    <span>{activityError}</span>
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
      )}

      {/* Goal Modal Form */}
      {showGoalModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Set Personal Goals</h3>
              <button
                onClick={() => setShowGoalModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveGoals} className="connect-form">
                <div className="form-group">
                  <label>Monthly Problems Goal (1–1000) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={monthlyInput}
                    onChange={(e) => setMonthlyInput(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'block' }}>
                    Target number of unique problems solved in a calendar month.
                  </span>
                </div>

                <div className="form-group">
                  <label>Daily Problems Goal (1–50) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={dailyInput}
                    onChange={(e) => setDailyInput(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem', display: 'block' }}>
                    Target number of unique problems solved per day.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingGoals}>
                    {savingGoals ? 'Saving...' : 'Save Goals'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="btn btn-secondary"
                    disabled={savingGoals}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sync Notice Modal */}
      {showSyncNoticeModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSyncNoticeModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sync-notice-modal-title"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="sync-notice-modal-title">Why was Sync Now removed?</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSyncNoticeModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                The manual <strong>Sync Now</strong> button was removed because it did not always provide a reliable or immediate response.
              </p>
              <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Your LeetCode statistics are now updated automatically in the background, so you no longer need to manually synchronize your account.
              </p>

              <h4 className="modal-section-title">What we implemented</h4>
              <ul className="modal-list">
                <li>Automatic LeetCode synchronization</li>
                <li>Background updates for connected members</li>
                <li>Automatic statistics updates</li>
                <li>Recent activity synchronization</li>
                <li>Submission history tracking</li>
                <li>Progress and challenge calculations based on stored submission data</li>
                <li>No manual action is required</li>
              </ul>

              <h4 className="modal-section-title">How often is data updated?</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                Automatic synchronization runs approximately every hour.
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                Your dashboard displays the latest successfully synchronized data.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowSyncNoticeModal(false)}
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

export default MemberDashboard;
