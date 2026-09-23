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
