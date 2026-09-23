const { pool } = require('../config/db');
const dsaRoadmap = require('../data/dsaRoadmap');

// Build sets of valid roadmap slugs and topic IDs
const validSlugsSet = new Set();
const validTopicIdsSet = new Set();
const slugToTopicIdMap = {};

dsaRoadmap.forEach((stage) => {
  stage.topics.forEach((topic) => {
    validTopicIdsSet.add(topic.id);
    topic.problems.forEach((prob) => {
      validSlugsSet.add(prob.slug);
      slugToTopicIdMap[prob.slug] = topic.id;
    });
  });
});

const VALID_NOTE_TYPES = new Set(['UNDERSTANDING', 'APPROACH', 'MISTAKE', 'KEY_POINT', 'GENERAL']);

// 1. Create a Note
exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { problemSlug, topicId, noteType, content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty.',
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Note content exceeds maximum length limit of 10,000 characters.',
      });
    }

    const typeUpper = (noteType || 'GENERAL').toUpperCase();
    if (!VALID_NOTE_TYPES.has(typeUpper)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note type.',
      });
    }

    let finalSlug = problemSlug ? problemSlug.trim() : null;
    let finalTopicId = topicId ? topicId.trim() : null;

    if (finalSlug) {
      if (!validSlugsSet.has(finalSlug)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid problem slug.',
        });
      }
      if (!finalTopicId && slugToTopicIdMap[finalSlug]) {
        finalTopicId = slugToTopicIdMap[finalSlug];
      }
    }

    if (finalTopicId && !validTopicIdsSet.has(finalTopicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic ID.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO roadmap_notes (user_id, problem_slug, topic_id, note_type, content)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, finalSlug, finalTopicId, typeUpper, content.trim()]
    );

    const [newNotes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Note saved successfully.',
      data: newNotes[0],
    });
  } catch (error) {
    console.error('createNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create note.',
    });
  }
};

// 2. Update a Note
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { noteType, content } = req.body;

    const [existing] = await pool.query(
      `SELECT id, user_id FROM roadmap_notes WHERE id = ?`,
      [noteId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this note.',
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty.',
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Note content exceeds maximum length limit of 10,000 characters.',
      });
    }

    const typeUpper = (noteType || 'GENERAL').toUpperCase();
    if (!VALID_NOTE_TYPES.has(typeUpper)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note type.',
      });
    }

    await pool.query(
      `UPDATE roadmap_notes
       SET note_type = ?, content = ?
       WHERE id = ? AND user_id = ?`,
      [typeUpper, content.trim(), noteId, userId]
    );

    const [updatedNotes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE id = ?`,
      [noteId]
    );

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: updatedNotes[0],
    });
  } catch (error) {
    console.error('updateNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update note.',
    });
  }
};

// 3. Delete a Note
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const [existing] = await pool.query(
      `SELECT id, user_id FROM roadmap_notes WHERE id = ?`,
      [noteId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this note.',
      });
    }

    await pool.query(
      `DELETE FROM roadmap_notes WHERE id = ? AND user_id = ?`,
      [noteId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    console.error('deleteNote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete note.',
    });
  }
};

// 4. Get Problem Notes
exports.getProblemNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params;

    if (!validSlugsSet.has(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid problem slug.',
      });
    }

    const [notes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE user_id = ? AND problem_slug = ?
       ORDER BY updated_at DESC`,
      [userId, slug]
    );

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('getProblemNotes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch problem notes.',
    });
  }
};

// 5. Get Topic Notes
exports.getTopicNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId } = req.params;

    if (!validTopicIdsSet.has(topicId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid topic ID.',
      });
    }

    const [notes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE user_id = ? AND topic_id = ?
       ORDER BY updated_at DESC`,
      [userId, topicId]
    );

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('getTopicNotes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch topic notes.',
    });
  }
};

// 6. Get All My Notes (With Filters & Search)
exports.getMyNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteType, topicId, problemSlug, search } = req.query;

    let query = `
      SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
      FROM roadmap_notes
      WHERE user_id = ?
    `;
    const params = [userId];

    if (noteType) {
      const typeUpper = noteType.toUpperCase();
      if (VALID_NOTE_TYPES.has(typeUpper)) {
        query += ` AND note_type = ?`;
        params.push(typeUpper);
      }
    }

    if (topicId) {
      query += ` AND topic_id = ?`;
      params.push(topicId);
    }

    if (problemSlug) {
      query += ` AND problem_slug = ?`;
      params.push(problemSlug);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      query += ` AND content LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY updated_at DESC`;

    const [notes] = await pool.query(query, params);

    // Also compute notes summary stats for authenticated user
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as totalNotes,
        COUNT(DISTINCT problem_slug) as problemsWithNotes,
        SUM(CASE WHEN note_type = 'MISTAKE' THEN 1 ELSE 0 END) as mistakesCount,
        SUM(CASE WHEN note_type = 'KEY_POINT' THEN 1 ELSE 0 END) as keyPointsCount,
        SUM(CASE WHEN note_type = 'UNDERSTANDING' THEN 1 ELSE 0 END) as understandingCount,
        SUM(CASE WHEN note_type = 'APPROACH' THEN 1 ELSE 0 END) as approachCount,
        SUM(CASE WHEN note_type = 'GENERAL' THEN 1 ELSE 0 END) as generalCount
       FROM roadmap_notes
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        notes,
        summary: {
          totalNotes: stats[0]?.totalNotes || 0,
          problemsWithNotes: stats[0]?.problemsWithNotes || 0,
          mistakesCount: stats[0]?.mistakesCount || 0,
          keyPointsCount: stats[0]?.keyPointsCount || 0,
          understandingCount: stats[0]?.understandingCount || 0,
          approachCount: stats[0]?.approachCount || 0,
          generalCount: stats[0]?.generalCount || 0,
        },
      },
    });
  } catch (error) {
    console.error('getMyNotes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal notes.',
    });
  }
};

// 7. Get Mistake Review Summary & Prioritized Problems (V14.6)
exports.getMistakeReview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Build map of roadmap problem metadata and slug -> roadmap order index
    const slugMetaMap = {};
    const slugOrderMap = {};
    let orderCounter = 0;

    dsaRoadmap.forEach((stage) => {
      stage.topics.forEach((topic) => {
        topic.problems.forEach((prob) => {
          slugMetaMap[prob.slug] = {
            title: prob.title,
            slug: prob.slug,
            difficulty: prob.difficulty,
            topicId: topic.id,
            topicTitle: topic.title,
            stageTitle: stage.title,
          };
          slugOrderMap[prob.slug] = orderCounter++;
        });
      });
    });

    // 1. Fetch user's distinct solved roadmap submission slugs
    const [solvedSubs] = await pool.query(
      `SELECT DISTINCT problem_slug 
       FROM leetcode_submissions 
       WHERE user_id = ?`,
      [userId]
    );
    const solvedSlugsSet = new Set(solvedSubs.map((s) => s.problem_slug));

    // 2. Fetch all MISTAKE notes for user
    const [mistakeNotes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE user_id = ? AND note_type = 'MISTAKE'
       ORDER BY updated_at DESC`,
      [userId]
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let recentMistakesCount = 0;
    const topicMistakeMap = {}; // topicId -> { topicTitle, count }
    const problemMistakesMap = {}; // problem_slug -> array of notes

    mistakeNotes.forEach((note) => {
      const noteDate = new Date(note.updated_at);
      if (noteDate >= sevenDaysAgo) {
        recentMistakesCount++;
      }

      if (note.topic_id) {
        if (!topicMistakeMap[note.topic_id]) {
          const meta = Object.values(slugMetaMap).find((m) => m.topicId === note.topic_id);
          topicMistakeMap[note.topic_id] = {
            topicId: note.topic_id,
            topicTitle: meta ? meta.topicTitle : note.topic_id,
            count: 0,
          };
        }
        topicMistakeMap[note.topic_id].count++;
      }

      if (note.problem_slug && validSlugsSet.has(note.problem_slug)) {
        if (!problemMistakesMap[note.problem_slug]) {
          problemMistakesMap[note.problem_slug] = [];
        }
        problemMistakesMap[note.problem_slug].push(note);
      }
    });

    // 3. Process each problem card & calculate deterministic review priority
    const problemCards = Object.keys(problemMistakesMap).map((slug) => {
      const notesForProblem = problemMistakesMap[slug];
      const meta = slugMetaMap[slug] || { title: slug, slug, difficulty: 'EASY', topicTitle: 'General' };
      const isCompleted = solvedSlugsSet.has(slug);

      // Find latest mistake note date for this problem
      let latestMs = 0;
      notesForProblem.forEach((n) => {
        const ms = new Date(n.updated_at).getTime();
        if (ms > latestMs) latestMs = ms;
      });

      const ageInDays = (now.getTime() - latestMs) / (24 * 60 * 60 * 1000);

      // Recent mistake weight
      let recentWeight = 1;
      if (ageInDays <= 1) recentWeight = 5;
      else if (ageInDays <= 3) recentWeight = 4;
      else if (ageInDays <= 7) recentWeight = 3;
      else if (ageInDays <= 14) recentWeight = 2;

      // Completion bonus
      const completionBonus = isCompleted ? 1 : 3;

      // Multiple mistake notes bonus
      let countBonus = 0;
      if (notesForProblem.length === 2) countBonus = 1;
      else if (notesForProblem.length >= 3) countBonus = 2;

      const priorityScore = recentWeight + completionBonus + countBonus;

      return {
        slug,
        title: meta.title,
        difficulty: meta.difficulty,
        topicId: meta.topicId,
        topicTitle: meta.topicTitle,
        stageTitle: meta.stageTitle,
        completed: isCompleted,
        mistakeCount: notesForProblem.length,
        notes: notesForProblem,
        latestMistakeAt: new Date(latestMs).toISOString(),
        priorityScore,
        roadmapOrder: slugOrderMap[slug] !== undefined ? slugOrderMap[slug] : 999,
      };
    });

    // Sort problem cards by priorityScore DESC, latestMistakeAt DESC, roadmapOrder ASC
    problemCards.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      const bTime = new Date(b.latestMistakeAt).getTime();
      const aTime = new Date(a.latestMistakeAt).getTime();
      if (bTime !== aTime) {
        return bTime - aTime;
      }
      return a.roadmapOrder - b.roadmapOrder;
    });

    // Recommended target (top item in review queue)
    let recommended = null;
    if (problemCards.length > 0) {
      const topCard = problemCards[0];
      recommended = {
        slug: topCard.slug,
        title: topCard.title,
        difficulty: topCard.difficulty,
        topicTitle: topCard.topicTitle,
        stageTitle: topCard.stageTitle,
        mistakeCount: topCard.mistakeCount,
        completed: topCard.completed,
        reason: 'You have personal mistake notes for this problem. Review them before attempting the problem again.',
      };
    }

    // Sort topic summaries by count DESC
    const topicSummary = Object.values(topicMistakeMap).sort((a, b) => b.count - a.count);

    // Recent 5 mistake notes
    const recent5Mistakes = mistakeNotes.slice(0, 5).map((n) => {
      const meta = slugMetaMap[n.problem_slug];
      return {
        id: n.id,
        slug: n.problem_slug,
        title: meta ? meta.title : n.problem_slug,
        topicTitle: meta ? meta.topicTitle : n.topic_id || 'General',
        content: n.content,
        updatedAt: n.updated_at,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          mistakeNotes: mistakeNotes.length,
          problemsWithMistakes: problemCards.length,
          recentMistakes: recentMistakesCount,
        },
        recommended,
        problems: problemCards,
        topicSummary,
        recent: recent5Mistakes,
      },
    });
  } catch (error) {
    console.error('getMistakeReview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mistake review data.',
    });
  }
};

// 8. Get Revision Session Raw Data (V14.7)
exports.getSessionData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user's distinct solved roadmap submission slugs
    const [solvedSubs] = await pool.query(
      `SELECT DISTINCT problem_slug 
       FROM leetcode_submissions 
       WHERE user_id = ?`,
      [userId]
    );
    const solvedSlugs = solvedSubs.map((s) => s.problem_slug);

    // 2. Fetch all notes for user
    const [allNotes] = await pool.query(
      `SELECT id, user_id, problem_slug, topic_id, note_type, content, created_at, updated_at
       FROM roadmap_notes
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        solvedSlugs,
        notes: allNotes,
      },
    });
  } catch (error) {
    console.error('getSessionData error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revision session data.',
    });
  }
};


