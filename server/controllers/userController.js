const { pool } = require('../config/db');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email, role, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
              leetcode_last_synced, leetcode_last_activity, leaderboard_opt_in, created_at 
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

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        ...u,
        leaderboard_opt_in: Boolean(u.leaderboard_opt_in),
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile.',
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Return team members (role = MEMBER) including leaderboard_opt_in status
    const [members] = await pool.query(
      `SELECT id, name, email, role, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
              leetcode_last_synced, leetcode_last_activity, leaderboard_opt_in, created_at 
       FROM users WHERE role = 'MEMBER' ORDER BY created_at DESC`
    );

    const formattedMembers = members.map((m) => ({
      ...m,
      leaderboard_opt_in: Boolean(m.leaderboard_opt_in),
    }));

    return res.status(200).json({
      success: true,
      message: 'Team members retrieved successfully',
      data: formattedMembers,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching team members.',
    });
  }
};

exports.getLeaderboardPrivacy = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query('SELECT leaderboard_opt_in FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        leaderboardOptIn: Boolean(users[0].leaderboard_opt_in),
      },
    });
  } catch (error) {
    console.error('getLeaderboardPrivacy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch leaderboard privacy setting.',
    });
  }
};

exports.updateLeaderboardPrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaderboardOptIn } = req.body;

    const optInValue = Boolean(leaderboardOptIn);

    await pool.query('UPDATE users SET leaderboard_opt_in = ? WHERE id = ?', [optInValue, userId]);

    return res.status(200).json({
      success: true,
      message: 'Leaderboard privacy setting updated successfully',
      data: {
        leaderboardOptIn: optInValue,
      },
    });
  } catch (error) {
    console.error('updateLeaderboardPrivacy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update leaderboard privacy setting.',
    });
  }
};
