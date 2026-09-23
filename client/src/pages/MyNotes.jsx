import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMyRoadmapNotes, updateRoadmapNote, deleteRoadmapNote } from '../services/api';

const NOTE_TYPES = [
  { value: 'UNDERSTANDING', label: 'Understanding' },
  { value: 'APPROACH', label: 'Approach' },
  { value: 'MISTAKE', label: 'Mistake' },
  { value: 'KEY_POINT', label: 'Key Point' },
  { value: 'GENERAL', label: 'General' },
];

const MyNotes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTopic = searchParams.get('topicId') || '';
  const initialSlug = searchParams.get('problemSlug') || '';
  const initialType = searchParams.get('noteType') || '';

  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [selectedType, setSelectedType] = useState(initialType);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('GENERAL');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [selectedTopic, selectedSlug, selectedType]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedTopic) params.topicId = selectedTopic;
      if (selectedSlug) params.problemSlug = selectedSlug;
      if (selectedType) params.noteType = selectedType;
      if (searchTerm) params.search = searchTerm;

      const res = await getMyRoadmapNotes(params);
      if (res.success && res.data) {
        setNotes(res.data.notes || []);
        setSummary(res.data.summary || null);
      } else {
        setError('Failed to fetch personal notes.');
      }
    } catch (err) {
      console.error('MyNotes fetch error:', err);
      setError('Unable to fetch personal notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditType(note.note_type);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (noteId) => {
    if (!editContent.trim()) return;
    try {
      setSavingEdit(true);
      const res = await updateRoadmapNote(noteId, {
        noteType: editType,
        content: editContent,
      });
      if (res.success) {
        setEditingNoteId(null);
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      setDeletingNoteId(noteId);
      const res = await deleteRoadmapNote(noteId);
      if (res.success) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '950px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          My DSA Notes
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
          Your personal learning insights, pattern key points, and recorded mistakes
        </p>
      </div>

      {/* Summary Cards Grid */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>
              Total Notes
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: '#3b82f6' }}>
              {summary.totalNotes}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
              Across {summary.problemsWithNotes} problems
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
              Mistakes Recorded
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: '#ef4444' }}>
              {summary.mistakesCount}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
              Avoid repeating
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
              Key Points
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: '#8b5cf6' }}>
              {summary.keyPointsCount}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
              Pattern insights
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Understandings
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0', color: '#059669' }}>
              {summary.understandingCount}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
              Concept clarity
            </span>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Note Type Filter */}
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', display: 'block', marginBottom: '0.25rem' }}>
                Note Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color)' }}
              >
                <option value="">All Types</option>
                {NOTE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters button */}
            {(selectedTopic || selectedSlug || selectedType || searchTerm) && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('');
                    setSelectedSlug('');
                    setSelectedType('');
                    setSearchTerm('');
                    setSearchParams({});
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search note content (e.g. HashMap, sliding window)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color)', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="card alert alert-danger" style={{ padding: '1.25rem' }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Notes Found</h3>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
            {searchTerm || selectedType || selectedTopic || selectedSlug
              ? 'No personal notes match your selected filters.'
              : 'You have not created any personal DSA notes yet. Open any roadmap problem to write down your learning insights!'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/member/roadmap')} style={{ cursor: 'pointer' }}>
            Go to DSA Journey
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notes.map((note) => {
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className="card"
                style={{
                  padding: '1.25rem',
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
                {/* Note Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.55rem',
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

                    {note.problem_slug && (
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)' }}>
                        Problem: <strong>{note.problem_slug}</strong>
                      </span>
                    )}

                    {note.topic_id && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                        ({note.topic_id})
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    Updated {new Date(note.updated_at).toLocaleString()}
                  </span>
                </div>

                {/* Content / Editor */}
                {isEditing ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', marginBottom: '0.5rem', display: 'block' }}
                    >
                      {NOTE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <textarea
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: 'var(--card-bg, #ffffff)',
                        color: 'var(--text-color)',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        lineHeight: '1.5',
                        boxSizing: 'border-box',
                        marginBottom: '0.75rem'
                      }}
                    ></textarea>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveEdit(note.id)}
                        disabled={savingEdit}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', cursor: 'pointer' }}
                      >
                        {savingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)', whiteSpace: 'pre-wrap', margin: '0 0 1rem 0' }}>
                      {note.content}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {note.problem_slug ? (
                        <button
                          className="btn btn-outline"
                          onClick={() => navigate(`/member/roadmap/problem/${note.problem_slug}`)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                        >
                          Open Problem →
                        </button>
                      ) : (
                        <div></div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleStartEdit(note)}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingNoteId === note.id}
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', color: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}
                        >
                          {deletingNoteId === note.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyNotes;
