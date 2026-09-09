const { pool } = require('../config/db');

// ADMIN ONLY: Get member historical solved problems by date range
exports.getAdminSubmissions = async (req, res) => {
  try {
    const { userId, from, to } = req.query;

    if (!userId || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'userId, from, and to parameters are required.',
      });
    }

    // Validate ISO date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Dates must be in YYYY-MM-DD format.',
      });
    }

    if (new Date(to) < new Date(from)) {
      return res.status(400).json({
        success: false,
        message: "'from' date cannot be after 'to' date.",
      });
    }

    // Check user existence and role = 'MEMBER'
    const [users] = await pool.query(
      'SELECT id, name, leetcode_username, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member user not found.',
      });
    }

    const memberUser = users[0];
    if (memberUser.role !== 'MEMBER') {
      return res.status(400).json({
        success: false,
        message: 'Submissions history can only be queried for MEMBER users.',
      });
    }

    // Inclusive date range
    const fromStr = `${from} 00:00:00`;
    const toStr = `${to} 23:59:59`;

    const [rows] = await pool.query(
      `SELECT problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?
       ORDER BY solved_at DESC`,
      [userId, fromStr, toStr]
    );

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const formattedProblems = rows.map((r) => {
      if (r.difficulty === 'EASY') easyCount++;
      if (r.difficulty === 'MEDIUM') mediumCount++;
      if (r.difficulty === 'HARD') hardCount++;

      return {
        title: r.title,
        slug: r.slug,
        difficulty: r.difficulty,
        language: r.language,
        solvedAt: new Date(r.solvedAt).toISOString(),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Solved problems fetched successfully.',
      data: {
        member: {
          id: memberUser.id,
          name: memberUser.name,
          leetcodeUsername: memberUser.leetcode_username,
        },
        dateRange: {
          from,
          to,
        },
        summary: {
          total: formattedProblems.length,
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
        },
        problems: formattedProblems,
      },
    });
  } catch (error) {
    console.error('getAdminSubmissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch solved problems history.',
    });
  }
};
