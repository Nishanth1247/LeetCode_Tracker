import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllChallenges,
  getAllTeams,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from '../services/api';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tab state: 'TEAM' | 'INDIVIDUAL'
  const [activeTab, setActiveTab] = useState('TEAM');

  // Filters
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal states (For Team Task creation/edit by Admin)
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const [teamId, setTeamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [target, setTarget] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [challengesRes, teamsRes] = await Promise.all([
        getAllChallenges(),
        getAllTeams(),
      ]);

      if (challengesRes.success) setChallenges(challengesRes.data || []);
      if (teamsRes.success) setTeams(teamsRes.data || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setError(err.response?.data?.message || 'Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(nextWeek);
  }, []);

  const openCreateModal = () => {
    setEditingChallenge(null);
    setTitle('');
    setDescription('');
    setDifficulty('EASY');
    setTarget(10);
    if (teams.length > 0) setTeamId(teams[0].id);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingChallenge(c);
    setTitle(c.title);
    setDescription(c.description || '');
    setDifficulty(c.difficulty);
    setTarget(c.target);
    setTeamId(c.teamId);
    setStartDate(new Date(c.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(c.endDate).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      if (editingChallenge) {
        const res = await updateChallenge(editingChallenge.id, {
          title,
          description,
          difficulty,
          target,
          startDate,
          endDate,
        });

        if (res.success) {
          setSuccess('Challenge updated successfully.');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await createChallenge({
          teamId,
          title,
          description,
          difficulty,
          target,
          startDate,
          endDate,
        });

        if (res.success) {
          setSuccess('Challenge created successfully.');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, taskTitle) => {
    if (!window.confirm(`Delete challenge "${taskTitle}"?`)) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await deleteChallenge(id);
      if (res.success) {
        setSuccess('Challenge deleted.');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete challenge.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading challenges...</p>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Separate tasks based strictly on assignmentType ('TEAM' vs 'INDIVIDUAL')
  const teamTasksList = challenges.filter((c) => (c.assignmentType || 'TEAM') === 'TEAM');
  const individualTasksList = challenges.filter((c) => c.assignmentType === 'INDIVIDUAL');

  // Filter Team Tasks
  const filteredTeamTasks = teamTasksList.filter((c) => {
    if (selectedTeamFilter !== 'ALL' && c.teamId !== parseInt(selectedTeamFilter, 10)) return false;
    if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) return false;
    return true;
  });

  // Filter Individual Tasks
  const filteredIndividualTasks = individualTasksList.filter((c) => {
    if (selectedTeamFilter !== 'ALL' && c.teamId !== parseInt(selectedTeamFilter, 10)) return false;
    if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) return false;
    if (selectedMemberFilter !== 'ALL' && c.assignedTo !== parseInt(selectedMemberFilter, 10)) return false;
    return true;
  });

  // Unique list of assigned members for filter dropdown
  const memberFilterOptions = Array.from(
    new Map(
      individualTasksList
        .filter((c) => c.assignedTo && c.assignedToName)
        .map((c) => [c.assignedTo, { id: c.assignedTo, name: c.assignedToName }])
    ).values()
  );

  // Group individual tasks by Team -> Member for clear display
  const groupedIndividualTasks = filteredIndividualTasks.reduce((acc, task) => {
    const tId = task.teamId;
    if (!acc[tId]) {
      acc[tId] = {
        teamName: task.teamName,
        membersMap: {},
      };
    }
    const mId = task.assignedTo || 0;
    const mName = task.assignedToName || 'Unassigned';

    if (!acc[tId].membersMap[mId]) {
      acc[tId].membersMap[mId] = {
        memberName: mName,
        tasks: [],
      };
    }
    acc[tId].membersMap[mId].tasks.push(task);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <h1 className="text-2xl font-bold">Challenges & Tasks</h1>
          <p className="welcome-subtitle">Manage team sprint goals and individual task assignments</p>
        </div>
        {activeTab === 'TEAM' && (
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ width: 'auto' }}
            disabled={teams.length === 0}
          >
            + Create Team Task
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => {
            setActiveTab('TEAM');
            setSelectedMemberFilter('ALL');
          }}
          className={`btn ${activeTab === 'TEAM' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', width: 'auto' }}
        >
          TEAM TASKS ({teamTasksList.length})
        </button>
        <button
          onClick={() => setActiveTab('INDIVIDUAL')}
          className={`btn ${activeTab === 'INDIVIDUAL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.85rem', width: 'auto' }}
        >
          INDIVIDUAL TASKS ({individualTasksList.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Team:</label>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.6rem',
                color: 'var(--text)',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'INDIVIDUAL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Member:</label>
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.6rem',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="ALL">All Members</option>
                {memberFilterOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem 0.6rem',
                color: 'var(--text)',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          {(selectedTeamFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedMemberFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedTeamFilter('ALL');
                setSelectedStatusFilter('ALL');
                setSelectedMemberFilter('ALL');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Challenge Form Modal */}
      {showModal && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h3>{editingChallenge ? 'Edit Team Task' : 'Create New Team Task'}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="connect-form">
              {!editingChallenge && (
                <div className="form-group">
                  <label>Assign to Team *</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem',
                      color: 'var(--text)',
                    }}
                    required
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Mixed September Sprint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Solve 50 problems together"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>
                    Difficulty *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
                    style={{
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.7rem',
                      color: 'var(--text)',
                    }}
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Problems *</label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label>
                    Start Date *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date *
                    {editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0] && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '0.3rem' }}>(Locked)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={Boolean(editingChallenge && todayStr >= new Date(editingChallenge.startDate).toISOString().split('T')[0])}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingChallenge ? 'Update Task' : 'Create Team Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 1: TEAM TASKS VIEW
         ============================================================ */}
      {activeTab === 'TEAM' && (
        <>
          {filteredTeamTasks.length === 0 ? (
            <div className="card empty-state" style={{ padding: '3rem 1.5rem' }}>
              <h3>No team tasks yet.</h3>
              <p className="welcome-subtitle">Create a team task to assign a goal to a team.</p>
            </div>
          ) : (
            <div className="card table-card">
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Task Title</th>
                      <th>Difficulty</th>
                      <th>Target</th>
                      <th>Team Progress</th>
                      <th>Timeline</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeamTasks.map((c) => (
                      <tr key={c.id}>
                        <td className="font-semibold">{c.teamName}</td>
                        <td>
                          <Link to={`/admin/challenges/${c.id}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {c.title}
                          </Link>
                        </td>
                        <td>
                          <span className="username-tag">{c.difficulty}</span>
                        </td>
                        <td className="font-semibold">{c.target}</td>
                        <td>
                          <div style={{ minWidth: '130px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                              <span>{c.solved || 0} / {c.target}</span>
                              <span>{c.percentage || 0}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${c.percentage || 0}%`, height: '100%', backgroundColor: c.percentage === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="sync-time">
                          {new Date(c.startDate).toLocaleDateString()} – {new Date(c.endDate).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                c.status === 'COMPLETED'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : c.status === 'EXPIRED'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(37, 99, 235, 0.15)',
                              color:
                                c.status === 'COMPLETED'
                                  ? 'var(--status-easy)'
                                  : c.status === 'EXPIRED'
                                  ? 'var(--status-hard)'
                                  : 'var(--primary)',
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Link
                              to={`/admin/challenges/${c.id}`}
                              style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                              }}
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => openEditModal(c)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.title)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          TAB 2: INDIVIDUAL TASKS VIEW (GROUPED BY TEAM)
         ============================================================ */}
      {activeTab === 'INDIVIDUAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            Individual tasks are assigned by Team Leaders to team members.
          </div>

          {Object.keys(groupedIndividualTasks).length === 0 ? (
            <div className="card empty-state" style={{ padding: '3rem 1.5rem' }}>
              <h3>No individual tasks yet.</h3>
              <p className="welcome-subtitle">
                Individual tasks will appear here when Team Leaders assign tasks to members.
              </p>
            </div>
          ) : (
            Object.entries(groupedIndividualTasks).map(([tId, teamGroup]) => (
              <div key={tId} className="card">
                <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>Team: {teamGroup.teamName}</h3>
                </div>
                <div className="card-body" style={{ padding: '1rem' }}>
                  {Object.entries(teamGroup.membersMap).map(([mId, memberGroup]) => (
                    <div key={mId} style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                        Member: {memberGroup.memberName}
                      </h4>
                      <div className="table-responsive">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Task Title</th>
                              <th>Assigned To</th>
                              <th>Target</th>
                              <th>Solved</th>
                              <th>Remaining</th>
                              <th>Progress</th>
                              <th>Difficulty</th>
                              <th>Timeline</th>
                              <th>Status</th>
                              <th>Assigned By</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {memberGroup.tasks.map((task) => (
                              <tr key={task.id}>
                                <td className="font-semibold">
                                  <Link to={`/admin/challenges/${task.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                    {task.title}
                                  </Link>
                                </td>
                                <td>{task.assignedToName || memberGroup.memberName}</td>
                                <td className="font-semibold">{task.target}</td>
                                <td className="text-easy font-semibold">{task.solved || 0}</td>
                                <td>{task.remaining ?? (task.target - (task.solved || 0))}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '110px' }}>
                                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                      <div style={{ width: `${task.percentage || 0}%`, height: '100%', backgroundColor: task.percentage === 100 ? 'var(--status-easy)' : 'var(--primary)' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{task.percentage || 0}%</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="username-tag">{task.difficulty}</span>
                                </td>
                                <td className="sync-time">
                                  {new Date(task.startDate).toLocaleDateString()} – {new Date(task.endDate).toLocaleDateString()}
                                </td>
                                <td>
                                  <span
                                    className="status-badge"
                                    style={{
                                      backgroundColor:
                                        task.status === 'COMPLETED'
                                          ? 'rgba(16, 185, 129, 0.15)'
                                          : task.status === 'EXPIRED'
                                          ? 'rgba(239, 68, 68, 0.15)'
                                          : 'rgba(37, 99, 235, 0.15)',
                                      color:
                                        task.status === 'COMPLETED'
                                          ? 'var(--status-easy)'
                                          : task.status === 'EXPIRED'
                                          ? 'var(--status-hard)'
                                          : 'var(--primary)',
                                    }}
                                  >
                                    {task.status}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                    {task.createdByName ? `${task.createdByName} (${task.creatorRole || 'Leader'})` : 'Team Leader'}
                                  </span>
                                </td>
                                <td>
                                  <Link
                                    to={`/admin/challenges/${task.id}`}
                                    style={{
                                      color: 'var(--primary)',
                                      fontWeight: 600,
                                      textDecoration: 'none',
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    View Details
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Challenges;

