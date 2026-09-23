import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getRevisionSessionData, getMyRoadmapProgress } from '../services/api';

const ALLOWED_SIZES = [5, 10, 15];
const VALID_MODES = ['mixed', 'mistakes', 'journey'];

const RevisionSession = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse mode & size from query parameters
  const paramMode = (searchParams.get('mode') || 'mixed').toLowerCase();
  const paramSize = parseInt(searchParams.get('size') || '5', 10);

  const initialMode = VALID_MODES.includes(paramMode) ? paramMode : 'mixed';
  const initialSize = ALLOWED_SIZES.includes(paramSize) ? paramSize : 5;

  const [mode, setMode] = useState(initialMode);
  const [size, setSize] = useState(initialSize);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Raw fetched data
  const [solvedSlugsSet, setSolvedSlugsSet] = useState(new Set());
  const [notesMap, setNotesMap] = useState({}); // slug -> array of notes
  const [stagesData, setStagesData] = useState([]);

  // Session state
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sessionRes, roadmapRes] = await Promise.all([
        getRevisionSessionData(),
        getMyRoadmapProgress(),
      ]);

      if (sessionRes.success && sessionRes.data && roadmapRes.success && roadmapRes.data) {
        setSolvedSlugsSet(new Set(sessionRes.data.solvedSlugs || []));
        setStagesData(roadmapRes.data.stages || []);

        // Group notes by problem_slug
        const map = {};
        (sessionRes.data.notes || []).forEach((n) => {
          if (n.problem_slug) {
            if (!map[n.problem_slug]) map[n.problem_slug] = [];
            map[n.problem_slug].push(n);
          }
        });
        setNotesMap(map);
      } else {
        setError('Failed to load revision session data.');
      }
    } catch (err) {
      console.error('Fetch session data error:', err);
      setError('Unable to fetch revision session data.');
    } finally {
      setLoading(false);
    }
  };

  // Re-build selected problems preview whenever mode, size, or raw data changes
  useEffect(() => {
    if (loading) return;

    // Collect all roadmap problems flattened with metadata & order
    const allProblems = [];
    const slugOrderMap = {};
    let orderCounter = 0;

    stagesData.forEach((stage) => {
      stage.topics.forEach((topic) => {
        topic.problems.forEach((prob) => {
          allProblems.push({
            ...prob,
            topicId: topic.id,
            topicTitle: topic.title,
            stageTitle: stage.title,
          });
          slugOrderMap[prob.slug] = orderCounter++;
        });
      });
    });

    let selected = [];

    if (mode === 'mistakes') {
      // 1. Filter problems that have MISTAKE notes
      const mistakeProbs = allProblems.filter((p) => {
        const pNotes = notesMap[p.slug] || [];
        return pNotes.some((n) => n.note_type === 'MISTAKE');
      });

      // Calculate priority score for each mistake problem
      const now = Date.now();
      const scoredMistakeProbs = mistakeProbs.map((prob) => {
        const pNotes = (notesMap[prob.slug] || []).filter((n) => n.note_type === 'MISTAKE');
        let latestMs = 0;
        pNotes.forEach((n) => {
          const ms = new Date(n.updated_at).getTime();
          if (ms > latestMs) latestMs = ms;
        });
        const ageInDays = (now - latestMs) / (24 * 60 * 60 * 1000);

        let recentWeight = 1;
        if (ageInDays <= 1) recentWeight = 5;
        else if (ageInDays <= 3) recentWeight = 4;
        else if (ageInDays <= 7) recentWeight = 3;
        else if (ageInDays <= 14) recentWeight = 2;

        const isCompleted = solvedSlugsSet.has(prob.slug);
        const completionBonus = isCompleted ? 1 : 3;

        let countBonus = 0;
        if (pNotes.length === 2) countBonus = 1;
        else if (pNotes.length >= 3) countBonus = 2;

        const priorityScore = recentWeight + completionBonus + countBonus;

        return {
          ...prob,
          priorityScore,
          latestMistakeAt: latestMs,
          notes: notesMap[prob.slug] || [],
          reason: 'Mistake recorded',
        };
      });

      scoredMistakeProbs.sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        if (b.latestMistakeAt !== a.latestMistakeAt) return b.latestMistakeAt - a.latestMistakeAt;
        return slugOrderMap[a.slug] - slugOrderMap[b.slug];
      });

      selected = scoredMistakeProbs.slice(0, size);
    } else if (mode === 'journey') {
      // Select first incomplete problems in roadmap order
      const incompleteProbs = allProblems.filter((p) => !solvedSlugsSet.has(p.slug));
      selected = incompleteProbs.slice(0, size).map((p) => ({
        ...p,
        notes: notesMap[p.slug] || [],
        reason: 'Incomplete roadmap problem',
      }));
    } else {
      // Mixed Revision Mode
      // Allocation target based on size
      let targetMistakes = 2;
      let targetIncomplete = 2;
      let targetCompleted = 1;

      if (size === 10) {
        targetMistakes = 4;
        targetIncomplete = 4;
        targetCompleted = 2;
      } else if (size === 15) {
        targetMistakes = 6;
        targetIncomplete = 6;
        targetCompleted = 3;
      }

      // Pool A: Mistakes
      const mistakeProbs = allProblems
        .filter((p) => (notesMap[p.slug] || []).some((n) => n.note_type === 'MISTAKE'))
        .map((p) => ({
          ...p,
          notes: notesMap[p.slug] || [],
          reason: 'Mistake recorded',
        }));

      // Pool B: Incomplete (not in mistakes pool)
      const mistakeSlugsSet = new Set(mistakeProbs.map((p) => p.slug));
      const incompleteProbs = allProblems
        .filter((p) => !solvedSlugsSet.has(p.slug) && !mistakeSlugsSet.has(p.slug))
        .map((p) => ({
          ...p,
          notes: notesMap[p.slug] || [],
          reason: 'Incomplete roadmap problem',
        }));

      // Pool C: Completed (not in mistakes pool)
      const completedProbs = allProblems
        .filter((p) => solvedSlugsSet.has(p.slug) && !mistakeSlugsSet.has(p.slug))
        .map((p) => ({
          ...p,
          notes: notesMap[p.slug] || [],
          reason: 'Completed roadmap review',
        }));

      const chosen = [];
      const chosenSlugs = new Set();

      // Pick from Pool A
      const pickA = mistakeProbs.slice(0, targetMistakes);
      pickA.forEach((p) => {
        chosen.push(p);
        chosenSlugs.add(p.slug);
      });

      // Pick from Pool B
      const pickB = incompleteProbs.filter((p) => !chosenSlugs.has(p.slug)).slice(0, targetIncomplete);
      pickB.forEach((p) => {
        chosen.push(p);
        chosenSlugs.add(p.slug);
      });

      // Pick from Pool C
      const pickC = completedProbs.filter((p) => !chosenSlugs.has(p.slug)).slice(0, targetCompleted);
      pickC.forEach((p) => {
        chosen.push(p);
        chosenSlugs.add(p.slug);
      });

      // If we haven't reached target size, fill remaining from leftover pools in order (A -> B -> C)
      if (chosen.length < size) {
        const remainingPool = [
          ...mistakeProbs.filter((p) => !chosenSlugs.has(p.slug)),
          ...incompleteProbs.filter((p) => !chosenSlugs.has(p.slug)),
          ...completedProbs.filter((p) => !chosenSlugs.has(p.slug)),
        ];
        remainingPool.slice(0, size - chosen.length).forEach((p) => {
          chosen.push(p);
          chosenSlugs.add(p.slug);
        });
      }

      selected = chosen.slice(0, size);
    }

    setSelectedProblems(selected);
  }, [mode, size, loading, solvedSlugsSet, notesMap]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setIsSessionComplete(false);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (currentIndex < selectedProblems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
      setIsSessionActive(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
          <button className="btn btn-primary" onClick={fetchSessionData} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate estimated time range from selected problems
  let minMinutes = 0;
  let maxMinutes = 0;
  selectedProblems.forEach((p) => {
    const diff = (p.difficulty || 'EASY').toUpperCase();
    if (diff === 'EASY') {
      minMinutes += 4;
      maxMinutes += 6;
    } else if (diff === 'MEDIUM') {
      minMinutes += 7;
      maxMinutes += 10;
    } else {
      minMinutes += 10;
      maxMinutes += 15;
    }
  });

  // Calculate session summary stats when completed
  const completedInSessionCount = selectedProblems.filter((p) => solvedSlugsSet.has(p.slug)).length;
  const incompleteInSessionCount = selectedProblems.length - completedInSessionCount;
  const mistakeProblemsInSessionCount = selectedProblems.filter((p) => (notesMap[p.slug] || []).some((n) => n.note_type === 'MISTAKE')).length;
  const uniqueTopicsCovered = [...new Set(selectedProblems.map((p) => p.topicTitle))];

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* ============================================================
          VIEW 1: SESSION PREVIEW & SETUP SCREEN
         ============================================================ */}
      {!isSessionActive && !isSessionComplete && (
        <>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/member/roadmap')}
              style={{ marginBottom: '1rem', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              ← Back to DSA Journey
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
              DSA Revision Session
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
              A focused set of problems selected from your roadmap for revision and practice.
            </p>
          </div>

          {/* Session Size & Mode Selection Controls */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Session Size Selector */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Session Size
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {ALLOWED_SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSize(sz);
                        setSearchParams({ mode, size: sz });
                      }}
                      style={{
                        padding: '0.45rem 1.25rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: size === sz ? '#3b82f6' : 'transparent',
                        color: size === sz ? '#ffffff' : 'var(--text-color)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {sz} Problems
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Mode Selector */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Session Mode
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'mixed', label: 'Mixed Revision' },
                    { id: 'mistakes', label: 'Mistake Review' },
                    { id: 'journey', label: 'Continue Journey' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setSearchParams({ mode: m.id, size });
                      }}
                      style={{
                        padding: '0.45rem 1.25rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: mode === m.id ? '#3b82f6' : 'transparent',
                        color: mode === m.id ? '#ffffff' : 'var(--text-color)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mode-Specific Empty State Handlers */}
          {mode === 'mistakes' && selectedProblems.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Mistake Problems Available</h3>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                No mistake-based revision problems yet. Write a MISTAKE note while practicing and they will appear here.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/member/roadmap/mistakes')} style={{ cursor: 'pointer' }}>
                Go to Mistake Review
              </button>
            </div>
          ) : mode === 'journey' && selectedProblems.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Your Roadmap is Complete!</h3>
              <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                You have solved all 100 roadmap problems. Use Mixed Revision to revisit completed problems.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMode('mixed');
                  setSearchParams({ mode: 'mixed', size });
                }}
                style={{ cursor: 'pointer' }}
              >
                Start Mixed Revision
              </button>
            </div>
          ) : (
            /* Selected Session Preview List */
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                    Session Preview ({selectedProblems.length} Problems)
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                    Estimated Time: <strong>{minMinutes}–{maxMinutes} minutes</strong>
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleStartSession}
                  style={{ fontWeight: 700, padding: '0.65rem 1.5rem', cursor: 'pointer' }}
                >
                  Start Session →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedProblems.map((prob, idx) => {
                  const isCompleted = solvedSlugsSet.has(prob.slug);

                  return (
                    <div
                      key={prob.slug}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary, #64748b)', width: '1.5rem' }}>
                          {idx + 1}.
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{prob.title}</div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                            {prob.topicTitle} • {prob.difficulty}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: prob.reason === 'Mistake recorded' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: prob.reason === 'Mistake recorded' ? '#ef4444' : '#3b82f6'
                          }}
                        >
                          {prob.reason}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary, #e2e8f0)',
                            color: isCompleted ? '#059669' : 'var(--text-secondary, #64748b)'
                          }}
                        >
                          {isCompleted ? '✓ Solved' : '○ Unsolved'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================
          VIEW 2: ACTIVE REVISION SESSION
         ============================================================ */}
      {isSessionActive && selectedProblems.length > 0 && (
        <>
          {/* Active Session Header & Progress Bar */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Revision Session — Problem {currentIndex + 1} of {selectedProblems.length}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                {Math.round(((currentIndex + 1) / selectedProblems.length) * 100)}% Complete
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.round(((currentIndex + 1) / selectedProblems.length) * 100)}%`,
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
          </div>

          {/* Current Problem Card */}
          {(() => {
            const currentProb = selectedProblems[currentIndex];
            const isCompleted = solvedSlugsSet.has(currentProb.slug);
            const pNotes = currentProb.notes || [];

            return (
              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                {/* Title & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.35rem 0' }}>
                      {currentProb.title}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                        Topic: <strong>{currentProb.topicTitle}</strong>
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor:
                            currentProb.difficulty === 'EASY'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : currentProb.difficulty === 'MEDIUM'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          color:
                            currentProb.difficulty === 'EASY'
                              ? '#059669'
                              : currentProb.difficulty === 'MEDIUM'
                              ? '#d97706'
                              : '#dc2626'
                        }}
                      >
                        {currentProb.difficulty}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary, #e2e8f0)',
                        color: isCompleted ? '#059669' : 'var(--text-secondary, #64748b)'
                      }}
                    >
                      {isCompleted ? '✓ Completed' : '○ Not Completed'}
                    </span>
                  </div>
                </div>

                {/* Reason for inclusion */}
                <div style={{ padding: '0.75rem 1rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.05))', borderLeft: '4px solid #3b82f6', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
                    <strong>Reason for inclusion:</strong> {currentProb.reason}
                  </span>
                </div>

                {/* Personal Notes for this problem */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                    Your Personal Notes ({pNotes.length})
                  </h3>

                  {pNotes.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                      No personal notes recorded for this problem yet.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {pNotes.map((n) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            backgroundColor: 'var(--card-bg, #ffffff)',
                            borderLeft:
                              n.note_type === 'MISTAKE'
                                ? '4px solid #ef4444'
                                : n.note_type === 'KEY_POINT'
                                ? '4px solid #8b5cf6'
                                : n.note_type === 'UNDERSTANDING'
                                ? '4px solid #059669'
                                : '4px solid #3b82f6'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: n.note_type === 'MISTAKE' ? '#ef4444' : '#3b82f6' }}>
                              {n.note_type}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                              {new Date(n.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-color)', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {n.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Practice Button */}
                <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/member/roadmap/problem/${currentProb.slug}`)}
                    style={{ fontWeight: 600, padding: '0.6rem 1.5rem', cursor: 'pointer' }}
                  >
                    Open Practice Workspace
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Session Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={handlePrev}
              style={{ opacity: currentIndex === 0 ? 0.5 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer' }}
            >
              ← Previous
            </button>

            <button
              className="btn btn-primary"
              onClick={handleNext}
              style={{ fontWeight: 700, padding: '0.6rem 1.5rem', cursor: 'pointer' }}
            >
              {currentIndex < selectedProblems.length - 1 ? 'Next Problem →' : 'Finish Session ✓'}
            </button>
          </div>
        </>
      )}

      {/* ============================================================
          VIEW 3: SESSION SUMMARY / COMPLETION SCREEN
         ============================================================ */}
      {isSessionComplete && (
        <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669', marginBottom: '0.5rem' }}>
            Revision Session Complete
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 2rem 0' }}>
            Great job! You have completed reviewing all {selectedProblems.length} selected roadmap problems.
          </p>

          {/* Session Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.05))', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Problems Reviewed</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedProblems.length}</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(16, 185, 129, 0.05))', borderRadius: '6px', borderLeft: '4px solid #059669' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Currently Completed</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669' }}>{completedInSessionCount}</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(245, 158, 11, 0.05))', borderRadius: '6px', borderLeft: '4px solid #d97706' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Still Incomplete</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{incompleteInSessionCount}</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary, rgba(239, 68, 68, 0.05))', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Mistake Problems Reviewed</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{mistakeProblemsInSessionCount}</span>
            </div>
          </div>

          {/* Topics Covered */}
          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Topics Covered ({uniqueTopicsCovered.length})
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {uniqueTopicsCovered.map((tTitle) => (
                <span key={tTitle} style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0.35rem 0.75rem', backgroundColor: 'var(--bg-secondary, #f1f5f9)', borderRadius: '4px', color: 'var(--text-color)' }}>
                  {tTitle}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsSessionActive(false);
                setIsSessionComplete(false);
              }}
              style={{ fontWeight: 600, padding: '0.65rem 1.5rem', cursor: 'pointer' }}
            >
              Start Another Session
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/member/roadmap')}
              style={{ fontWeight: 600, padding: '0.65rem 1.5rem', cursor: 'pointer' }}
            >
              Return to DSA Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionSession;
