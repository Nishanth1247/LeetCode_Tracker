import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getMyRoadmapProgress,
  getProblemRoadmapNotes,
  createRoadmapNote,
  updateRoadmapNote,
  deleteRoadmapNote
} from '../services/api';

const NOTE_TYPES = [
  { value: 'UNDERSTANDING', label: 'Understanding' },
  { value: 'APPROACH', label: 'Approach' },
  { value: 'MISTAKE', label: 'Mistake' },
  { value: 'KEY_POINT', label: 'Key Point' },
  { value: 'GENERAL', label: 'General' },
];

const RoadmapProblem = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [visibleHintsCount, setVisibleHintsCount] = useState(0);

  // Notes state
  const [problemNotes, setProblemNotes] = useState([]);
  const [noteType, setNoteType] = useState('UNDERSTANDING');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('GENERAL');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchRoadmap();
    fetchNotes();
  }, [slug]);

  const fetchNotes = async () => {
    try {
      const res = await getProblemRoadmapNotes(slug);
      if (res.success && res.data) {
        setProblemNotes(res.data);
      }
    } catch (err) {
      console.error('Fetch problem notes error:', err);
    }
  };

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      setVisibleHintsCount(0);
      const res = await getMyRoadmapProgress();
      if (res.success && res.data) {
        setRoadmapData(res.data);
      } else {
        setError('Failed to load problem data.');
      }
    } catch (err) {
      console.error('RoadmapProblem fetch error:', err);
      setError('Unable to fetch problem data.');
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

  if (error || !roadmapData) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card alert alert-danger" style={{ padding: '1.5rem' }}>
          <h3>Error</h3>
          <p>{error || 'Problem not found.'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/member/roadmap')} style={{ marginTop: '1rem' }}>
            Back to DSA Journey
          </button>
        </div>
      </div>
    );
  }

  const { stages } = roadmapData;

  // Flatten all problems across stages and topics to find matching problem, index, topic, and stage
  let matchedProblem = null;
  let matchedTopic = null;
  let matchedStage = null;
  let flattenedProblems = [];

  stages.forEach((stage) => {
    stage.topics.forEach((topic) => {
      topic.problems.forEach((prob) => {
        const item = {
          ...prob,
          topicId: topic.id,
          topicTitle: topic.title,
          topicCompleted: topic.completed,
          topicTotal: topic.total,
          topicPercentage: topic.percentage,
          topicIsCompleted: topic.isCompleted,
          stageTitle: stage.title,
        };
        flattenedProblems.push(item);
        if (prob.slug === slug) {
          matchedProblem = item;
          matchedTopic = topic;
          matchedStage = stage;
        }
      });
    });
  });

  if (!matchedProblem) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Problem Not Found</h2>
          <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem' }}>
            The requested problem "{slug}" could not be found in the DSA Journey roadmap.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/member/roadmap')}>
            Return to DSA Journey
          </button>
        </div>
      </div>
    );
  }

  // Find previous and next problem in flattened list
  const currentIndex = flattenedProblems.findIndex((p) => p.slug === slug);
  const prevProblem = currentIndex > 0 ? flattenedProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex < flattenedProblems.length - 1 ? flattenedProblems[currentIndex + 1] : null;

  // Find problem number within topic
  const topicProblems = matchedTopic.problems || [];
  const problemIndexInTopic = topicProblems.findIndex((p) => p.slug === slug) + 1;

  const showNextHint = () => {
    if (matchedProblem.hints && visibleHintsCount < matchedProblem.hints.length) {
      setVisibleHintsCount((prev) => prev + 1);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Navigation Back to Topic / Journey */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/member/roadmap')}
          style={{ cursor: 'pointer', fontSize: '0.9rem' }}
        >
          ← Back to DSA Journey
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
          {matchedStage.title} / {matchedTopic.title}
        </span>
      </div>

      {/* Topic Progress Header Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {matchedTopic.title} — Problem {problemIndexInTopic} of {matchedTopic.total}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
            {matchedTopic.percentage}% Topic Progress
          </span>
        </div>
        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-secondary, #e2e8f0)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${matchedTopic.percentage}%`, backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Main Problem Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Header Title & Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              {matchedProblem.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor:
                    matchedProblem.difficulty === 'EASY'
                      ? 'rgba(16, 185, 129, 0.15)'
                      : matchedProblem.difficulty === 'MEDIUM'
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  color:
                    matchedProblem.difficulty === 'EASY'
                      ? '#059669'
                      : matchedProblem.difficulty === 'MEDIUM'
                      ? '#d97706'
                      : '#dc2626'
                }}
              >
                {matchedProblem.difficulty}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)' }}>
                Topic: <strong>{matchedTopic.title}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                backgroundColor: matchedProblem.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary, #e2e8f0)',
                color: matchedProblem.completed ? '#059669' : 'var(--text-secondary, #64748b)'
              }}
            >
              {matchedProblem.completed ? '✓ Completed' : '○ Not Completed'}
            </span>
          </div>
        </div>

        {/* Why this problem? */}
        {matchedProblem.whyThisProblem && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Why this problem?
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-color)', margin: 0 }}>
              {matchedProblem.whyThisProblem}
            </p>
          </div>
        )}

        {/* Learning Objective */}
        {matchedProblem.learningObjective && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              What this problem teaches
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-color)', margin: 0 }}>
              {matchedProblem.learningObjective}
            </p>
          </div>
        )}

        {/* Recognition */}
        {matchedTopic.recognitionClues && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Recognition
            </h3>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-color)', margin: 0 }}>
              {matchedTopic.recognitionClues}
            </p>
          </div>
        )}

        {/* Think About Section */}
        {matchedProblem.thinkingQuestions && matchedProblem.thinkingQuestions.length > 0 && (
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem', backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.05))', borderRadius: '6px', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Before you solve — Ask yourself:
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)' }}>
              {matchedProblem.thinkingQuestions.map((q, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Progressive Hint System */}
        {matchedProblem.hints && matchedProblem.hints.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Need a hint?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {matchedProblem.hints.slice(0, visibleHintsCount).map((hintText, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: 'var(--text-color)'
                  }}
                >
                  <strong style={{ color: '#d97706', marginRight: '0.5rem' }}>Hint {idx + 1}:</strong>
                  {hintText}
                </div>
              ))}

              {visibleHintsCount < matchedProblem.hints.length && (
                <button
                  className="btn btn-outline"
                  onClick={showNextHint}
                  style={{ alignSelf: 'flex-start', fontSize: '0.85rem', padding: '0.4rem 0.85rem', borderColor: '#d97706', color: '#d97706', cursor: 'pointer' }}
                >
                  {visibleHintsCount === 0 ? 'Reveal Hint 1' : `Reveal Hint ${visibleHintsCount + 1}`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expected Approach & Complexity */}
        {matchedProblem.approach && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Expected Thinking & Approach
            </h3>
            {matchedProblem.approach.bruteForce && (
              <p style={{ fontSize: '0.9rem', margin: '0 0 0.35rem 0', color: 'var(--text-color)' }}>
                <strong>Brute Force:</strong> {matchedProblem.approach.bruteForce}
              </p>
            )}
            {matchedProblem.approach.optimized && (
              <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: 'var(--text-color)' }}>
                <strong>Optimized Approach:</strong> {matchedProblem.approach.optimized}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--bg-secondary, #f1f5f9)', borderRadius: '4px' }}>
                <strong>Time Complexity:</strong> {matchedProblem.timeComplexity || 'O(n)'}
              </div>
              <div style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', backgroundColor: 'var(--bg-secondary, #f1f5f9)', borderRadius: '4px' }}>
                <strong>Space Complexity:</strong> {matchedProblem.spaceComplexity || 'O(1)'}
              </div>
            </div>
          </div>
        )}

        {/* LeetCode Action Button & Solved State Notice */}
        <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: matchedProblem.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary, #f8fafc)', border: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
          {matchedProblem.completed ? (
            <div>
              <p style={{ fontWeight: 700, color: '#059669', fontSize: '1rem', margin: '0 0 0.75rem 0' }}>
                ✓ You have already solved this problem!
              </p>
              <a
                href={matchedProblem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-block' }}
              >
                Practice Again on LeetCode
              </a>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', margin: '0 0 0.75rem 0' }}>
                Solve this problem on LeetCode. Your roadmap will update automatically after the next successful submission sync.
              </p>
              <a
                href={matchedProblem.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ textDecoration: 'none', padding: '0.65rem 1.5rem', fontWeight: 600, display: 'inline-block' }}
              >
                Open on LeetCode
              </a>
            </div>
          )}
        </div>

        {/* ============================================================
            MY NOTES SECTION (V14.5)
           ============================================================ */}
        <div className="card" style={{ padding: '1.75rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
            My Notes
          </h2>

          {/* Educational Guidance Box */}
          <div style={{ padding: '1rem', borderRadius: '6px', backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.05))', borderLeft: '4px solid #3b82f6', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', display: 'block', marginBottom: '0.4rem' }}>
              Useful things to write down:
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-color)', lineHeight: '1.5' }}>
              <li>What pattern did I recognize?</li>
              <li>What mistake did I make?</li>
              <li>Why does the optimized approach work?</li>
              <li>What should I remember next time?</li>
            </ul>
          </div>

          {/* Quick Template Buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', display: 'block', marginBottom: '0.4rem' }}>
              Quick Templates:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem', cursor: 'pointer' }}
                onClick={() => {
                  setNoteType('UNDERSTANDING');
                  setNoteContent((prev) => (prev ? prev : 'I understood... '));
                }}
              >
                I understood...
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem', cursor: 'pointer', borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => {
                  setNoteType('MISTAKE');
                  setNoteContent((prev) => (prev ? prev : 'My mistake: '));
                }}
              >
                My mistake...
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem', cursor: 'pointer', borderColor: '#8b5cf6', color: '#8b5cf6' }}
                onClick={() => {
                  setNoteType('KEY_POINT');
                  setNoteContent((prev) => (prev ? prev : 'Remember: '));
                }}
              >
                Remember...
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem', cursor: 'pointer', borderColor: '#3b82f6', color: '#3b82f6' }}
                onClick={() => {
                  setNoteType('APPROACH');
                  setNoteContent((prev) => (prev ? prev : 'My approach: '));
                }}
              >
                My approach...
              </button>
            </div>
          </div>

          {/* Note Type Selector */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', display: 'block', marginBottom: '0.35rem' }}>
              Note Type
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color)', fontWeight: 600, fontSize: '0.9rem' }}
            >
              {NOTE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note Content Textarea */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              rows={4}
              placeholder="Write your personal notes for this problem..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-color)',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            ></textarea>
          </div>

          {/* Save Button & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={savingNote || !noteContent.trim()}
              onClick={async () => {
                if (!noteContent.trim()) return;
                try {
                  setSavingNote(true);
                  const res = await createRoadmapNote({
                    problemSlug: slug,
                    topicId: matchedTopic.id,
                    noteType,
                    content: noteContent,
                  });
                  if (res.success) {
                    setNoteContent('');
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                    fetchNotes();
                  }
                } catch (err) {
                  console.error('Save note error:', err);
                } finally {
                  setSavingNote(false);
                }
              }}
              style={{ fontWeight: 600, padding: '0.55rem 1.25rem', cursor: noteContent.trim() ? 'pointer' : 'not-allowed' }}
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>

            {saveSuccess && (
              <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                ✓ Saved
              </span>
            )}
          </div>

          {/* List of Existing Notes for this Problem */}
          {problemNotes.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                Saved Notes ({problemNotes.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {problemNotes.map((note) => {
                  const isEditing = editingNoteId === note.id;

                  return (
                    <div
                      key={note.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: 'var(--bg-secondary, rgba(59, 130, 246, 0.02))',
                        borderLeft:
                          note.note_type === 'MISTAKE'
                            ? '4px solid #ef4444'
                            : note.note_type === 'KEY_POINT'
                            ? '4px solid #8b5cf6'
                            : note.note_type === 'UNDERSTANDING'
                            ? '4px solid #059669'
                            : note.note_type === 'APPROACH'
                            ? '4px solid #3b82f6'
                            : '4px solid #64748b'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor:
                              note.note_type === 'MISTAKE'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : note.note_type === 'KEY_POINT'
                                ? 'rgba(139, 92, 246, 0.15)'
                                : note.note_type === 'UNDERSTANDING'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : note.note_type === 'APPROACH'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(100, 116, 139, 0.15)',
                            color:
                              note.note_type === 'MISTAKE'
                                ? '#ef4444'
                                : note.note_type === 'KEY_POINT'
                                ? '#8b5cf6'
                                : note.note_type === 'UNDERSTANDING'
                                ? '#059669'
                                : note.note_type === 'APPROACH'
                                ? '#3b82f6'
                                : '#64748b'
                          }}
                        >
                          {note.note_type}
                        </span>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                          {new Date(note.updated_at).toLocaleString()}
                        </span>
                      </div>

                      {isEditing ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', marginBottom: '0.5rem', display: 'block' }}
                          >
                            {NOTE_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            rows={3}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', marginBottom: '0.5rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          ></textarea>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary"
                              disabled={savingEdit}
                              onClick={async () => {
                                if (!editContent.trim()) return;
                                try {
                                  setSavingEdit(true);
                                  const res = await updateRoadmapNote(note.id, {
                                    noteType: editType,
                                    content: editContent,
                                  });
                                  if (res.success) {
                                    setEditingNoteId(null);
                                    fetchNotes();
                                  }
                                } catch (err) {
                                  console.error('Update note error:', err);
                                } finally {
                                  setSavingEdit(false);
                                }
                              }}
                              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                            >
                              {savingEdit ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => setEditingNoteId(null)}
                              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-color)', whiteSpace: 'pre-wrap', margin: '0 0 0.75rem 0' }}>
                            {note.content}
                          </p>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditContent(note.content);
                                setEditType(note.note_type);
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this note?')) return;
                                try {
                                  const res = await deleteRoadmapNote(note.id);
                                  if (res.success) {
                                    fetchNotes();
                                  }
                                } catch (err) {
                                  console.error('Delete note error:', err);
                                }
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Previous / Next Problem Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn btn-secondary"
          disabled={!prevProblem}
          onClick={() => prevProblem && navigate(`/member/roadmap/problem/${prevProblem.slug}`)}
          style={{ opacity: prevProblem ? 1 : 0.5, cursor: prevProblem ? 'pointer' : 'not-allowed' }}
        >
          ← Previous Problem
        </button>

        <button
          className="btn btn-secondary"
          disabled={!nextProblem}
          onClick={() => nextProblem && navigate(`/member/roadmap/problem/${nextProblem.slug}`)}
          style={{ opacity: nextProblem ? 1 : 0.5, cursor: nextProblem ? 'pointer' : 'not-allowed' }}
        >
          Next Problem →
        </button>
      </div>

      {/* Stage / Topic Continuity Footer */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
          What comes next?
        </span>
        {matchedTopic.isCompleted ? (
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#059669', fontWeight: 600 }}>
            Topic "{matchedTopic.title}" is complete! Continue to the next topic on your roadmap.
          </p>
        ) : (
          <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-color)' }}>
            Current Topic: <strong>{matchedTopic.title}</strong> ({matchedTopic.completed} / {matchedTopic.total} completed). Continue practicing topic problems to complete this step.
          </p>
        )}
      </div>
    </div>
  );
};

export default RoadmapProblem;
