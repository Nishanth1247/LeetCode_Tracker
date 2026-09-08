const { pool } = require('../config/db');

exports.getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user current stats
    const [users] = await pool.query(
      `SELECT leetcode_total_solved, leetcode_easy_solved, 
              leetcode_medium_solved, leetcode_hard_solved 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const u = users[0];

    // Fetch user historical snapshots ordered by recorded_at ASC
    const [historyRows] = await pool.query(
      `SELECT total_solved, easy_solved, medium_solved, hard_solved, recorded_at 
       FROM leetcode_stats_history 
       WHERE user_id = ? 
       ORDER BY recorded_at ASC`,
      [userId]
    );

    const formattedHistory = historyRows.map((row) => ({
      recordedAt: new Date(row.recorded_at).toISOString(),
      totalSolved: row.total_solved || 0,
      easySolved: row.easy_solved || 0,
      mediumSolved: row.medium_solved || 0,
      hardSolved: row.hard_solved || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        currentStats: {
          totalSolved: u.leetcode_total_solved || 0,
          easySolved: u.leetcode_easy_solved || 0,
          mediumSolved: u.leetcode_medium_solved || 0,
          hardSolved: u.leetcode_hard_solved || 0,
        },
        history: formattedHistory,
      },
    });
  } catch (error) {
    console.error('getMyAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load analytics.',
    });
  }
};

exports.getTeamAnalytics = async (req, res) => {
  try {
    // ADMIN only requirement is enforced by requireAdmin middleware in routes

    // Select connected team members (role = MEMBER and leetcode_username IS NOT NULL)
    const [members] = await pool.query(
      `SELECT id, name, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved 
       FROM users 
       WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL`
    );

    const connectedMembers = members.length;
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    members.forEach((m) => {
      totalSolved += m.leetcode_total_solved || 0;
      easySolved += m.leetcode_easy_solved || 0;
      mediumSolved += m.leetcode_medium_solved || 0;
      hardSolved += m.leetcode_hard_solved || 0;
    });

    const averageSolved = connectedMembers > 0 ? Math.round(totalSolved / connectedMembers) : 0;

    // Aggregate team history by calendar date
    const [teamHistoryRows] = await pool.query(
      `SELECT DATE_FORMAT(h.recorded_at, '%Y-%m-%d') as date, 
              SUM(h.total_solved) as total_solved, 
              SUM(h.easy_solved) as easy_solved, 
              SUM(h.medium_solved) as medium_solved, 
              SUM(h.hard_solved) as hard_solved 
       FROM leetcode_stats_history h 
       JOIN users u ON h.user_id = u.id 
       WHERE u.role = 'MEMBER' AND u.leetcode_username IS NOT NULL 
       GROUP BY DATE_FORMAT(h.recorded_at, '%Y-%m-%d') 
       ORDER BY date ASC`
    );

    const formattedTeamHistory = teamHistoryRows.map((row) => ({
      date: row.date,
      totalSolved: parseInt(row.total_solved, 10) || 0,
      easySolved: parseInt(row.easy_solved, 10) || 0,
      mediumSolved: parseInt(row.medium_solved, 10) || 0,
      hardSolved: parseInt(row.hard_solved, 10) || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        connectedMembers,
        totalSolved,
        averageSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          username: m.leetcode_username,
          totalSolved: m.leetcode_total_solved || 0,
          easySolved: m.leetcode_easy_solved || 0,
          mediumSolved: m.leetcode_medium_solved || 0,
          hardSolved: m.leetcode_hard_solved || 0,
        })),
        history: formattedTeamHistory,
      },
    });
  } catch (error) {
    console.error('getTeamAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load team analytics.',
    });
  }
};
