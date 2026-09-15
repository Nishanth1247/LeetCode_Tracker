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

    const [rows] = await pool.query(querySQL);

    const formattedRows = rows.map((r) => {
      const easy = r.leetcode_easy_solved || 0;
      const medium = r.leetcode_medium_solved || 0;
      const hard = r.leetcode_hard_solved || 0;
      const leaderboardScore = (easy * 1) + (medium * 2.5) + (hard * 5);

      return {
        ...r,
        leetcode_total_solved: r.leetcode_total_solved || 0,
        leetcode_easy_solved: easy,
        leetcode_medium_solved: medium,
        leetcode_hard_solved: hard,
        leaderboardScore,
        leaderboard_opt_in: Boolean(r.leaderboard_opt_in),
      };
    });

    // Deterministic sorting:
    // 1. leaderboardScore DESC
    // 2. leetcode_medium_solved DESC
    // 3. leetcode_hard_solved DESC
    // 4. leetcode_total_solved DESC
    // 5. name ASC
    formattedRows.sort((a, b) => {
      if (b.leaderboardScore !== a.leaderboardScore) {
        return b.leaderboardScore - a.leaderboardScore;
      }
      if (b.leetcode_medium_solved !== a.leetcode_medium_solved) {
        return b.leetcode_medium_solved - a.leetcode_medium_solved;
      }
      if (b.leetcode_hard_solved !== a.leetcode_hard_solved) {
        return b.leetcode_hard_solved - a.leetcode_hard_solved;
      }
      if (b.leetcode_total_solved !== a.leetcode_total_solved) {
        return b.leetcode_total_solved - a.leetcode_total_solved;
      }
      return a.name.localeCompare(b.name);
    });

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

