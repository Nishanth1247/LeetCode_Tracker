import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRoadmapProgress } from '../services/api';

const DSAJourney = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'progress'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeLang, setActiveLang] = useState('python');

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyRoadmapProgress();
      if (res.success && res.data) {
        setRoadmapData(res.data);
      } else {
        setError('Failed to load DSA Journey data.');
      }
    } catch (err) {
      console.error('DSAJourney fetch error:', err);
      setError('Unable to fetch DSA Journey progress.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="loading-container" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card alert alert-danger" style={{ padding: '1.5rem' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchRoadmap} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    overall,
    difficultyProgress,
    currentTopic,
    recommendedNext,
    weeklyStats,
    streak,
    recentlySolvedRoadmap,
    stages,
  } = roadmapData || {
    overall: { completed: 0, total: 100, percentage: 0 },
    difficultyProgress: {
      easy: { completed: 0, total: 40, percentage: 0 },
      medium: { completed: 0, total: 45, percentage: 0 },
      hard: { completed: 0, total: 15, percentage: 0 },
    },
    weeklyStats: { weeklyActivity: [], problemsSolvedThisWeek: 0, activeDaysThisWeek: 0, avgPerActiveDay: 0 },
    streak: { currentStreak: 0, longestStreak: 0 },
    recentlySolvedRoadmap: [],
    stages: [],
  };

  // Helper to find next topic in sequence
  const findNextTopic = (currTopicId) => {
    let foundCurrent = false;
    for (const stage of stages) {
      for (const topic of stage.topics) {
        if (foundCurrent) {
          return topic;
        }
        if (topic.id === currTopicId) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  // If a topic is selected, render Guided Learning View
  if (selectedTopic) {
    const nextTopic = findNextTopic(selectedTopic.id);

    return (
      <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setSelectedTopic(null)}
          style={{ marginBottom: '1.5rem', cursor: 'pointer' }}
        >
          ← Back to Journey
        </button>

        {/* Topic Header Card */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              {selectedTopic.title}
            </h1>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: selectedTopic.isCompleted ? '#059669' : '#3b82f6', color: '#fff' }}>
              {selectedTopic.completed} / {selectedTopic.total} Completed ({selectedTopic.percentage}%)
            </span>
          </div>

          {/* Section 01: What is this? */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              01 — What is this?
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: 0 }}>
              {selectedTopic.description}
            </p>
          </div>

          {/* Section 02: Why do we need it? */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              02 — Why do we need it?
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: 0 }}>
              {selectedTopic.whyItMatters}
            </p>
          </div>

          {/* Section 03: Connection to Previous Topic */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.05))', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Why are we learning this? (Connection)
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: 0 }}>
              {selectedTopic.connection}
            </p>
          </div>

          {/* Section 04: How to recognize this pattern */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              03 — How to recognize this pattern
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: 0 }}>
              {selectedTopic.recognitionClues}
            </p>
          </div>

          {/* Section 05: How it works / Core Idea */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              04 — How it works (Core Idea)
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', margin: 0 }}>
              {selectedTopic.coreIdea}
            </p>
          </div>

          {/* Section 06: Pattern Templates (Language Tabs) */}
          {selectedTopic.codeTemplates && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                05 — Generic Pattern Example
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {['python', 'java', 'cpp', 'c'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: activeLang === lang ? '#3b82f6' : 'transparent',
                      color: activeLang === lang ? '#ffffff' : 'var(--text-color)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {lang === 'cpp' ? 'C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              <pre
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--code-bg, #1e293b)',
                  color: 'var(--code-color, #f8fafc)',
                  fontSize: '0.875rem',
                  overflowX: 'auto',
                  lineHeight: '1.5',
                  margin: 0
                }}
              >
                <code>{selectedTopic.codeTemplates[activeLang] || selectedTopic.codeTemplates.python}</code>
              </pre>
            </div>
          )}

          {/* Section 07: Common Mistakes */}
          {selectedTopic.commonMistakes && selectedTopic.commonMistakes.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                06 — Common Mistakes to Avoid
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {selectedTopic.commonMistakes.map((mistake, idx) => (
                  <li key={idx} style={{ marginBottom: '0.35rem' }}>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* LeetCode Practice Problems */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            07 — LeetCode Practice Problems
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span>{selectedTopic.completed} / {selectedTopic.total} Completed</span>
              <span>{selectedTopic.percentage}%</span>
            </div>
            <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${selectedTopic.percentage}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          {selectedTopic.problems.length === 0 ? (
            <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
              No specific LeetCode problems required for this conceptual introduction. Review the concepts above and proceed to the next topic.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedTopic.problems.map((prob, idx) => (
                <div
                  key={prob.slug}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: prob.completed ? 'var(--bg-completed, rgba(16, 185, 129, 0.05))' : 'var(--card-bg, #ffffff)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 300px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.1rem', color: prob.completed ? '#059669' : 'var(--text-secondary, #64748b)' }}>
                      {prob.completed ? '✓' : '○'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {idx + 1}. {prob.title}
                      </div>
                      {prob.whyThisProblem && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                          <strong style={{ color: 'var(--text-color)' }}>Why this problem is here:</strong> {prob.whyThisProblem}
                        </p>
                      )}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          backgroundColor:
                            prob.difficulty === 'EASY'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : prob.difficulty === 'MEDIUM'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            prob.difficulty === 'EASY'
                              ? '#059669'
                              : prob.difficulty === 'MEDIUM'
                              ? '#d97706'
                              : '#dc2626'
                        }}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/member/roadmap/problem/${prob.slug}`)}
                      style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', cursor: 'pointer' }}
                    >
                      Open Workspace
                    </button>
                    <a
                      href={prob.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem', textDecoration: 'none' }}
                    >
                      Open LeetCode
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation / Continuity at Bottom */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: selectedTopic.isCompleted ? '4px solid #059669' : '4px solid #3b82f6' }}>
          {selectedTopic.isCompleted ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                  Topic Complete
                </span>
                <p style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>
                  You have completed all problems in this topic.
                </p>
                {nextTopic && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
                    Next topic: <strong>{nextTopic.title}</strong>
                  </span>
                )}
              </div>

              {nextTopic && (
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedTopic(nextTopic)}
                  style={{ fontWeight: 600, padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  Continue to Next Topic →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                  Continue Learning
                </span>
                <p style={{ fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>
                  Complete the remaining problems in this topic to mark it complete and advance your journey.
                </p>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                  Progress: {selectedTopic.completed} / {selectedTopic.total} problems completed
                </span>
              </div>
              {selectedTopic.problems.find((p) => !p.completed) && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const nextProb = selectedTopic.problems.find((p) => !p.completed);
                    if (nextProb) navigate(`/member/roadmap/problem/${nextProb.slug}`);
                  }}
                  style={{ fontWeight: 600, padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  Continue Practice
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Find corresponding topic object for Continue Journey
  const handleContinueJourney = () => {
    if (!currentTopic) return;
    for (const stage of stages) {
      for (const topic of stage.topics) {
        if (topic.id === currentTopic.id) {
          setSelectedTopic(topic);
          return;
        }
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '950px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            DSA JOURNEY
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
            From beginner to interview-ready
          </p>
        </div>

        {/* Top-Level Tabs (Journey vs Progress) */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary, #e2e8f0)', padding: '0.25rem', borderRadius: '8px' }}>
          <button
            onClick={() => setActiveTab('journey')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'journey' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeTab === 'journey' ? '#3b82f6' : 'var(--text-color)',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: activeTab === 'journey' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'progress' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeTab === 'progress' ? '#3b82f6' : 'var(--text-color)',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: activeTab === 'progress' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Progress & Stats
          </button>
        </div>
      </div>

      {/* ============================================================
          TAB 1: JOURNEY ROADMAP VIEW
         ============================================================ */}
      {activeTab === 'journey' && (
        <>
          {/* Overall Progress Card */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Overall Progress
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                {overall.completed} / {overall.total}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary, #64748b)' }}>
                Problems ({overall.percentage}%)
              </span>
            </div>
            <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${overall.percentage}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          {/* Current Step Card */}
          {currentTopic && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                    Current Step
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    {currentTopic.title}
                  </h3>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
                    {currentTopic.completed} / {currentTopic.total} problems completed ({currentTopic.percentage}%)
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleContinueJourney}
                  style={{ fontWeight: 600, padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                >
                  Continue Journey
                </button>
              </div>
            </div>
          )}

          {/* Stages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {stages.map((stage) => (
              <div key={stage.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.03em', margin: 0 }}>
                    {stage.title}
                  </h2>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                    {stage.completed} / {stage.total} ({stage.percentage}%)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stage.topics.map((topic) => {
                    const isCurrent = currentTopic && currentTopic.id === topic.id;
                    let statusSymbol = '○';
                    let statusColor = 'var(--text-secondary, #64748b)';

                    if (topic.isCompleted) {
                      statusSymbol = '✓';
                      statusColor = '#059669';
                    } else if (isCurrent) {
                      statusSymbol = '→';
                      statusColor = '#3b82f6';
                    }

                    return (
                      <div
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          border: isCurrent ? '1px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                          backgroundColor: isCurrent ? 'var(--bg-current, rgba(59, 130, 246, 0.05))' : 'transparent',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: statusColor, width: '1rem', textAlign: 'center' }}>
                            {statusSymbol}
                          </span>
                          <span style={{ fontWeight: isCurrent ? 700 : 500, fontSize: '0.95rem', color: isCurrent ? '#3b82f6' : 'var(--text-color)' }}>
                            {topic.title}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                            {topic.completed} / {topic.total}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
                            ›
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ============================================================
          TAB 2: PROGRESS & STATISTICS VIEW (V14.3)
         ============================================================ */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Completed Journey Notice or Current Target */}
          {overall.isComplete ? (
            <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid #059669', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', margin: '0 0 0.5rem 0' }}>
                DSA Journey Complete
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-color)', margin: '0 0 0.5rem 0' }}>
                100 / 100 Problems Solved (100%)
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                Congratulations — you have completed the entire DSA roadmap sequence!
              </p>
            </div>
          ) : (
            recommendedNext && (
              <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.35rem' }}>
                  Recommended Next Target
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                      {recommendedNext.title} ({recommendedNext.difficulty})
                    </h3>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
                      Topic: <strong>{recommendedNext.topicTitle}</strong> — {recommendedNext.why}
                    </span>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/member/roadmap/problem/${recommendedNext.slug}`)}
                    style={{ fontWeight: 600, padding: '0.6rem 1.25rem', cursor: 'pointer' }}
                  >
                    Continue Practice
                  </button>
                </div>
              </div>
            )
          )}

          {/* 2. Overall Progress Overview & Difficulty Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Overall */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>
                Overall Roadmap
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {overall.completed} / {overall.total}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>
                {overall.percentage}% Solved
              </div>
            </div>

            {/* Easy */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Easy Progress
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {difficultyProgress.easy.completed} / {difficultyProgress.easy.total}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                {difficultyProgress.easy.percentage}%
              </div>
            </div>

            {/* Medium */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                Medium Progress
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {difficultyProgress.medium.completed} / {difficultyProgress.medium.total}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600 }}>
                {difficultyProgress.medium.percentage}%
              </div>
            </div>

            {/* Hard */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                Hard Progress
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {difficultyProgress.hard.completed} / {difficultyProgress.hard.total}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                {difficultyProgress.hard.percentage}%
              </div>
            </div>
          </div>

          {/* 3. Streak & Weekly Activity Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Roadmap Streak Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                DSA Roadmap Streak
              </h3>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Current Streak</span>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{streak.currentStreak} <span style={{ fontSize: '1rem' }}>days</span></span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Longest Streak</span>
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-color)' }}>{streak.longestStreak} <span style={{ fontSize: '1rem' }}>days</span></span>
                </div>
              </div>
            </div>

            {/* Weekly Activity Summary */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                This Week Summary
              </h3>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Problems Solved</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{weeklyStats.problemsSolvedThisWeek}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Active Days</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{weeklyStats.activeDaysThisWeek} / 7</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Avg / Active Day</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{weeklyStats.avgPerActiveDay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Weekly Activity Bar Chart Grid (Mon -> Sun) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
              Weekly Roadmap Activity (Mon — Sun)
            </h3>
            {weeklyStats.problemsSolvedThisWeek === 0 ? (
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', margin: 0 }}>
                No roadmap activity recorded for this week yet.
              </p>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                {weeklyStats.weeklyActivity.map((dayItem) => (
                  <div key={dayItem.day} style={{ flex: '1 1 0', minWidth: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: dayItem.count > 0 ? '#3b82f6' : 'var(--text-secondary, #64748b)' }}>
                      {dayItem.count}
                    </span>
                    <div style={{ height: '60px', width: '100%', maxWidth: '30px', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: '100%',
                          height: dayItem.count > 0 ? `${Math.min(100, dayItem.count * 25)}%` : '0%',
                          backgroundColor: '#3b82f6',
                          borderRadius: '4px',
                          transition: 'height 0.3s ease'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                      {dayItem.day}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Recent Roadmap Activity & Topic Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Recently Solved */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                Recently Solved Roadmap Problems
              </h3>
              {recentlySolvedRoadmap.length === 0 ? (
                <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', margin: 0 }}>
                  No roadmap problems solved yet. Start with the first problem in Stage 1!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentlySolvedRoadmap.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.02))'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.title}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                          {item.topicTitle} • {item.difficulty}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        {new Date(item.solvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stage Progress Summary */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                Stage Progress Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {stages.map((st, idx) => (
                  <div key={st.id} style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Stage {idx}: {st.title.replace(/^STAGE \d+ — /, '')}</span>
                      <span>{st.completed} / {st.total} ({st.percentage}%)</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${st.percentage}%`, backgroundColor: st.isCompleted ? '#059669' : '#3b82f6' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSAJourney;
