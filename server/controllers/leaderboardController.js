const { pool } = require('../config/db');

exports.getLeaderboard = async (req, res) => {
  try {
    const userRole = req.user.role;

    // MEMBER requests filter by leaderboard_opt_in = TRUE
    // ADMIN requests view all connected MEMBER accounts regardless of opt-in status
    let querySQL = `
      SELECT id, name, leetcode_username, leetcode_total_solved, 
             leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
             leetcode_last_synced, leaderboard_opt_in 
      FROM users 
      WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL 
    `;

    if (userRole === 'MEMBER') {
      querySQL += ` AND leaderboard_opt_in = TRUE `;
    }

    querySQL += ` ORDER BY leetcode_total_solved DESC, leetcode_medium_solved DESC, leetcode_hard_solved DESC`;

    const [rows] = await pool.query(querySQL);

    const formattedRows = rows.map((r) => ({
      ...r,
      leaderboard_opt_in: Boolean(r.leaderboard_opt_in),
    }));

    return res.status(200).json({
      success: true,
      data: formattedRows,
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load leaderboard.',
    });
  }
};
