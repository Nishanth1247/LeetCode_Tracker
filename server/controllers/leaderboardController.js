const { pool } = require('../config/db');

exports.getLeaderboard = async (req, res) => {
  try {
    // Select only MEMBER users who have connected a LeetCode username
    // Ordered by leetcode_total_solved DESC, leetcode_medium_solved DESC, leetcode_hard_solved DESC
    const [rows] = await pool.query(
      `SELECT id, name, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
              leetcode_last_synced 
       FROM users 
       WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL 
       ORDER BY leetcode_total_solved DESC, leetcode_medium_solved DESC, leetcode_hard_solved DESC`
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load leaderboard.',
    });
  }
};
