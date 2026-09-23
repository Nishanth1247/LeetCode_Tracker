import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMistakeReview } from '../services/api';

const MistakeReview = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Filters
  const [filterType, setFilterType] = useState('all'); // 'all' | 'recent' | 'uncompleted' | 'completed'
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMistakeReview();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Failed to load mistake review data.');
      }
    } catch (err) {
      console.error('Fetch mistake review error:', err);
      setError('Unable to fetch mistake review data.');
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

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card alert alert-danger" style={{ padding: '1.5rem' }}>
          <h3>Error</h3>
          <p>{error || 'Failed to load mistake review.'}</p>
          <button className="btn btn-primary" onClick={fetchMistakes} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, recommended, problems, topicSummary, recent } = data;

  // Filter problems based on filterType, selectedTopic, and searchTerm
  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filteredProblems = problems.filter((prob) => {
    // Filter Type
    if (filterType === 'recent') {
      const latestMs = new Date(prob.latestMistakeAt).getTime();
      if (latestMs < sevenDaysAgoMs) return false;
    } else if (filterType === 'uncompleted') {
      if (prob.completed) return false;
    } else if (filterType === 'completed') {
      if (!prob.completed) return false;
    }

    // Topic Filter
    if (selectedTopic && prob.topicId !== selectedTopic) {
      return false;
    }

    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchTitle = prob.title.toLowerCase().includes(term);
      const matchTopic = prob.topicTitle.toLowerCase().includes(term);
      const matchNotes = prob.notes.some((n) => n.content.toLowerCase().includes(term));
      if (!matchTitle && !matchTopic && !matchNotes) return false;
    }

    return true;
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '950px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          Mistake Review
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
          Deterministic spaced revision based on your personal recorded mistake notes
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
            Problems with Mistakes
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {summary.problemsWithMistakes}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Requires attention
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' }}>
            Total Mistake Notes
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {summary.mistakeNotes}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Recorded insights
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
            Problems to Revisit
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.25rem 0' }}>
            {summary.recentMistakes}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Recorded in last 7 days
          </span>
        </div>
      </div>

      {/* Empty State if 0 mistakes */}
      {summary.mistakeNotes === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Mistake Notes Yet
          </h2>
          <p style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
            Mistake notes are useful when you get something wrong or discover an important lesson while solving. Open any problem to record your mistakes!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/member/roadmap')} style={{ cursor: 'pointer' }}>
            Start Journey
          </button>
        </div>
      ) : (
        <>
          {/* Top Review Target (Recommended) */}
          {recommended && (
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                Recommended Review
              </span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    {recommended.title} ({recommended.difficulty})
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                    Topic: <strong>{recommended.topicTitle}</strong> — {recommended.reason} ({recommended.mistakeCount} mistake note{recommended.mistakeCount === 1 ? '' : 's'})
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/member/roadmap/problem/${recommended.slug}`)}
                  style={{ fontWeight: 600, padding: '0.6rem 1.25rem', backgroundColor: '#ef4444', borderColor: '#ef4444', cursor: 'pointer' }}
                >
                  Review Now
                </button>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'recent', label: 'Recent (7 Days)' },
                    { id: 'uncompleted', label: 'Uncompleted Problems' },
                    { id: 'completed', label: 'Completed Problems' },
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      onClick={() => setFilterType(flt.id)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        backgroundColor: filterType === flt.id ? '#3b82f6' : 'transparent',
                        color: filterType === flt.id ? '#ffffff' : 'var(--text-color)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {flt.label}
                    </button>
                  ))}
                </div>

                {/* Topic Selector */}
                {topicSummary.length > 0 && (
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color)', fontSize: '0.85rem' }}
                  >
                    <option value="">All Topics</option>
                    {topicSummary.map((ts) => (
                      <option key={ts.topicId} value={ts.topicId}>
                        {ts.topicTitle} ({ts.count})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Search Box */}
              <input
                type="text"
                placeholder="Search mistake notes or problem title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', backgroundColor: 'var(--card-bg, #ffffff)', color: 'var(--text-color)', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Mistakes by Topic Summary */}
          {topicSummary.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                More Mistakes Recorded (By Topic)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {topicSummary.map((ts) => (
                  <div
                    key={ts.topicId}
                    onClick={() => setSelectedTopic(selectedTopic === ts.topicId ? '' : ts.topicId)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      border: selectedTopic === ts.topicId ? '1px solid #3b82f6' : '1px solid var(--border-color, #e2e8f0)',
                      backgroundColor: selectedTopic === ts.topicId ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary, rgba(239, 68, 68, 0.02))',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ts.topicTitle}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
                      {ts.count} note{ts.count === 1 ? '' : 's'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Problem Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
              Mistake Review Queue ({filteredProblems.length} Problems)
            </h3>

            {filteredProblems.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary, #64748b)', margin: 0 }}>
                  No mistake problems match your selected filters.
                </p>
              </div>
            ) : (
              filteredProblems.map((prob) => (
                <div key={prob.slug} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                          {prob.title}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
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
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: prob.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary, #e2e8f0)', color: prob.completed ? '#059669' : 'var(--text-secondary, #64748b)' }}>
                          {prob.completed ? '✓ Completed' : '○ Needs Practice'}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
                        Topic: <strong>{prob.topicTitle}</strong> • {prob.mistakeCount} mistake note{prob.mistakeCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/member/roadmap/problem/${prob.slug}`)}
                      style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', cursor: 'pointer' }}
                    >
                      Review Problem →
                    </button>
                  </div>

                  {/* List of Mistake Notes for this Problem */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--bg-secondary, rgba(239, 68, 68, 0.03))', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    {prob.notes.map((n, idx) => (
                      <div key={n.id} style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-color)' }}>
                        <strong style={{ color: '#ef4444', marginRight: '0.4rem' }}>Note {idx + 1}:</strong>
                        {n.content}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Mistakes Section */}
          {recent.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary, #64748b)' }}>
                Recent Mistakes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recent.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      backgroundColor: 'var(--card-bg, #ffffff)',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                          Mistake
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-color)', margin: '0 0 0.2rem 0' }}>
                        "{item.content}"
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      className="btn btn-outline"
                      onClick={() => navigate(`/member/roadmap/problem/${item.slug}`)}
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MistakeReview;
