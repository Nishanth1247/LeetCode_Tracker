const { pool } = require('../config/db');
const leetcodeService = require('../services/leetcodeService');

/**
 * Helper function to insert a stats history snapshot ONLY if stats have changed
 * compared to the user's latest recorded snapshot in leetcode_stats_history.
 */
async function recordSnapshotIfChanged(userId, totalSolved, easySolved, mediumSolved, hardSolved) {
  try {
    const [latestSnapshots] = await pool.query(
      `SELECT total_solved, easy_solved, medium_solved, hard_solved 
       FROM leetcode_stats_history 
       WHERE user_id = ? 
       ORDER BY recorded_at DESC, id DESC 
       LIMIT 1`,
      [userId]
    );

    if (latestSnapshots.length > 0) {
      const latest = latestSnapshots[0];
      if (
        latest.total_solved === totalSolved &&
        latest.easy_solved === easySolved &&
        latest.medium_solved === mediumSolved &&
        latest.hard_solved === hardSolved
      ) {
        // Skip duplicate snapshot insertion
        return;
      }
    }

    // Insert new snapshot
    await pool.query(
      `INSERT INTO leetcode_stats_history (user_id, total_solved, easy_solved, medium_solved, hard_solved)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, totalSolved, easySolved, mediumSolved, hardSolved]
    );
  } catch (err) {
    console.error('Failed to record stats history snapshot:', err.message);
  }
}

exports.connectLeetCode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'LeetCode username is required.',
      });
    }

    // Fetch stats from LeetCode service
    const stats = await leetcodeService.getLeetCodeStats(username);
    const now = new Date();

    // Update user in MySQL database
    await pool.query(
      `UPDATE users 
       SET leetcode_username = ?,
           leetcode_total_solved = ?,
           leetcode_easy_solved = ?,
           leetcode_medium_solved = ?,
           leetcode_hard_solved = ?,
           leetcode_total_questions = ?,
           leetcode_ranking = ?,
           leetcode_last_synced = ?
       WHERE id = ?`,
      [
        stats.username,
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        now,
        userId,
      ]
    );

    // Record historical snapshot if changed
    await recordSnapshotIfChanged(
      userId,
      stats.totalSolved,
      stats.easySolved,
      stats.mediumSolved,
      stats.hardSolved
    );

    // V8.1: Sync initial submissions into leetcode_submissions
    // Use ON DUPLICATE KEY UPDATE to repair any existing rows with NULL difficulty/language
    try {
      const historySubmissions = await leetcodeService.getAcceptedSubmissionHistory(stats.username);
      for (const sub of historySubmissions) {
        await pool.query(
          `INSERT INTO leetcode_submissions 
           (user_id, problem_title, problem_slug, difficulty, language, solved_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             difficulty = COALESCE(VALUES(difficulty), difficulty),
             language = COALESCE(VALUES(language), language),
             problem_title = COALESCE(VALUES(problem_title), problem_title)`,
          [userId, sub.problemTitle, sub.problemSlug, sub.difficulty, sub.language, sub.solvedAt]
        );
      }
    } catch (subErr) {
      console.error('Non-fatal initial submission history sync error:', subErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'LeetCode profile connected successfully',
      data: {
        username: stats.username,
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        totalQuestions: stats.totalQuestions,
        ranking: stats.ranking,
        lastSynced: now.toISOString(),
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to connect LeetCode profile.',
    });
  }
};

exports.syncLeetCode = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's connected LeetCode username from DB
    const [users] = await pool.query('SELECT leetcode_username FROM users WHERE id = ?', [userId]);

    if (users.length === 0 || !users[0].leetcode_username) {
      return res.status(400).json({
        success: false,
        message: 'LeetCode account is not connected',
      });
    }

    const leetcodeUsername = users[0].leetcode_username;

    // Re-fetch current statistics from LeetCode
    const stats = await leetcodeService.getLeetCodeStats(leetcodeUsername);
    const now = new Date();

    // Update DB with latest stats and timestamp
    await pool.query(
      `UPDATE users 
       SET leetcode_total_solved = ?,
           leetcode_easy_solved = ?,
           leetcode_medium_solved = ?,
           leetcode_hard_solved = ?,
           leetcode_total_questions = ?,
           leetcode_ranking = ?,
           leetcode_last_synced = ?
       WHERE id = ?`,
      [
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        now,
        userId,
      ]
    );

    // Record historical snapshot if changed
    await recordSnapshotIfChanged(
      userId,
      stats.totalSolved,
      stats.easySolved,
      stats.mediumSolved,
      stats.hardSolved
    );

    // V8.1: Sync submissions into leetcode_submissions
    // Use ON DUPLICATE KEY UPDATE to repair any existing rows with NULL difficulty/language
    try {
      const historySubmissions = await leetcodeService.getAcceptedSubmissionHistory(leetcodeUsername);
      for (const sub of historySubmissions) {
        await pool.query(
          `INSERT INTO leetcode_submissions 
           (user_id, problem_title, problem_slug, difficulty, language, solved_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             difficulty = COALESCE(VALUES(difficulty), difficulty),
             language = COALESCE(VALUES(language), language),
             problem_title = COALESCE(VALUES(problem_title), problem_title)`,
          [userId, sub.problemTitle, sub.problemSlug, sub.difficulty, sub.language, sub.solvedAt]
        );
      }
    } catch (subErr) {
      console.error('Non-fatal submission history sync error:', subErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'LeetCode statistics synced successfully',
      data: {
        username: stats.username,
        totalSolved: stats.totalSolved,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        totalQuestions: stats.totalQuestions,
        ranking: stats.ranking,
        lastSynced: now.toISOString(),
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to sync LeetCode statistics.',
    });
  }
};

exports.getMeLeetCodeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT leetcode_username, leetcode_total_solved, leetcode_easy_solved, 
              leetcode_medium_solved, leetcode_hard_solved, leetcode_total_questions, 
              leetcode_ranking, leetcode_last_synced 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0 || !users[0].leetcode_username) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const u = users[0];

    return res.status(200).json({
      success: true,
      data: {
        username: u.leetcode_username,
        totalSolved: u.leetcode_total_solved || 0,
        easySolved: u.leetcode_easy_solved || 0,
        mediumSolved: u.leetcode_medium_solved || 0,
        hardSolved: u.leetcode_hard_solved || 0,
        totalQuestions: u.leetcode_total_questions,
        ranking: u.leetcode_ranking,
        lastSynced: u.leetcode_last_synced ? new Date(u.leetcode_last_synced).toISOString() : null,
      },
    });
  } catch (error) {
    console.error('getMeLeetCodeStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching LeetCode data.',
    });
  }
};
