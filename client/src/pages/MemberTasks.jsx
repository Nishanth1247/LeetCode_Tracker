import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyChallenges, getChallengeProgress } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MemberTasks = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamTasks, setTeamTasks] = useState([]);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [isLeaderUser, setIsLeaderUser] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyChallenges();
      if (res.success && res.data) {
        setIsLeaderUser(Boolean(res.data.isLeader));
        const rawTeam = res.data.teamTasks || [];
        const rawInd = res.data.individualTasks || [];

        // Fetch detailed progress for each task
        const teamPromises = rawTeam.map((t) => getChallengeProgress(t.id).catch(() => null));
        const indPromises = rawInd.map((t) => getChallengeProgress(t.id).catch(() => null));

        const teamResults = await Promise.all(teamPromises);
        const indResults = await Promise.all(indPromises);

        const enrichedTeam = teamResults.filter((r) => r && r.success).map((r) => r.data);
        const enrichedInd = indResults.filter((r) => r && r.success).map((r) => r.data);

        setTeamTasks(enrichedTeam);
        setIndividualTasks(enrichedInd);
      }
    } catch (err) {
      console.error('Failed to load member tasks:', err);
      setError(err.response?.data?.message || 'Failed to load your tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  // Filter tasks based on status
  const filterByStatus = (taskList) => {
    if (activeFilter === 'ALL') return taskList;
    return taskList.filter((item) => item.status === activeFilter);
  };

  const filteredTeam = filterByStatus(teamTasks);
  const filteredInd = filterByStatus(individualTasks);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="welcome-subtitle">Overview of your team tasks and assigned individual goals</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {['ALL', 'ACTIVE', 'COMPLETED', 'EXPIRED'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`btn ${activeFilter === status ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', width: 'auto' }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Grid Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* TEAM TASKS SECTION */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
            Team Tasks ({filteredTeam.length})
          </h2>

          {filteredTeam.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="welcome-subtitle">No active team task.</p>
              <span className="card-description">Your Admin can create a team task.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredTeam.map(({ challenge, progress, status, membersProgress }) => {
                const myProg = membersProgress && membersProgress.length > 0 ? membersProgress[0] : null;
                const mySolved = myProg ? myProg.solved : 0;
                const myRemaining = myProg ? myProg.remaining : Math.max(0, challenge.target - mySolved);
                const myPct = myProg ? myProg.percentage : Math.min(100, Math.round((mySolved / challenge.target) * 100));

                return (
                  <div key={challenge.id} className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'inline-block' }}>
                          TEAM TASK
                        </span>
                        <h3>{challenge.title}</h3>
                        <p className="welcome-subtitle" style={{ color: 'var(--text-secondary)' }}>
                          Team: <strong>{challenge.teamName}</strong>
                        </p>
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            status === 'COMPLETED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : status === 'EXPIRED'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(37, 99, 235, 0.15)',
                          color:
                            status === 'COMPLETED'
                              ? 'var(--status-easy)'
                              : status === 'EXPIRED'
                              ? 'var(--status-hard)'
                              : 'var(--primary)',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                        <div>Team Target: <strong style={{ color: 'var(--text)' }}>{challenge.target}</strong></div>
                        <div>Difficulty: <strong style={{ color: 'var(--text)' }}>{challenge.difficulty}</strong></div>
                        <div>Start: <span style={{ color: 'var(--text)' }}>{new Date(challenge.startDate).toLocaleDateString()}</span></div>
                        <div>Deadline: <span style={{ color: 'var(--text)' }}>{new Date(challenge.endDate).toLocaleDateString()}</span></div>
                      </div>

                      {/* Normal Member strictly sees OWN contribution */}
                      <div style={{ marginTop: '0.75rem', backgroundColor: 'var(--surface-hover)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          <span>My Contribution</span>
                          <span>{mySolved} / {challenge.target} ({myPct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${myPct}%`, height: '100%', backgroundColor: status === 'COMPLETED' ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                          <span>My Remaining: {myRemaining}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* INDIVIDUAL TASKS SECTION */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
            {isLeaderUser ? 'Tasks Given By Me' : 'My Individual Tasks'} ({filteredInd.length})
          </h2>

          {filteredInd.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="welcome-subtitle">
                {isLeaderUser ? 'No tasks given to team members yet.' : 'No individual tasks assigned yet.'}
              </p>
              <span className="card-description">
                {isLeaderUser ? 'You can assign individual tasks from the My Team page.' : 'Your Team Leader can assign tasks to you.'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredInd.map(({ challenge, progress, status, membersProgress }) => {
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
                  <div key={challenge.id} className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="status-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#9333ea', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem', display: 'inline-block' }}>
                          {badgeLabel}
                        </span>
                        <h3>{challenge.title}</h3>
                        {isLeaderUser ? (
                          assignedName && (
                            <p className="welcome-subtitle" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                              Assigned To: <span style={{ color: 'var(--text)' }}>{assignedName}</span>
                            </p>
                          )
                        ) : (
                          <p className="welcome-subtitle" style={{ color: 'var(--text-secondary)' }}>
                            Assigned by: <strong>Team Leader</strong>
                          </p>
                        )}
                      </div>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor:
                            status === 'COMPLETED'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : status === 'EXPIRED'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(37, 99, 235, 0.15)',
                          color:
                            status === 'COMPLETED'
                              ? 'var(--status-easy)'
                              : status === 'EXPIRED'
                              ? 'var(--status-hard)'
                              : 'var(--primary)',
                        }}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="card-body">
                      {challenge.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {challenge.description}
                        </p>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                        <div>Target: <strong style={{ color: 'var(--text)' }}>{target}</strong></div>
                        <div>Difficulty: <strong style={{ color: 'var(--text)' }}>{challenge.difficulty}</strong></div>
                        <div>Start: <span style={{ color: 'var(--text)' }}>{new Date(challenge.startDate).toLocaleDateString()}</span></div>
                        <div>Deadline: <span style={{ color: 'var(--text)' }}>{new Date(challenge.endDate).toLocaleDateString()}</span></div>
                      </div>

                      <div style={{ marginTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                          <span>Progress</span>
                          <span>{solved} / {target} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: status === 'COMPLETED' ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                          <span>Remaining: {remaining}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberTasks;
