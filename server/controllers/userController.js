const { pool } = require('../config/db');

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email, role, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
              leetcode_last_synced, leetcode_last_activity, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: users[0],
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
    // Return team members (role = MEMBER) including V4 leetcode_last_activity
    const [members] = await pool.query(
      `SELECT id, name, email, role, leetcode_username, leetcode_total_solved, 
              leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved, 
              leetcode_last_synced, leetcode_last_activity, created_at 
       FROM users WHERE role = 'MEMBER' ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      message: 'Team members retrieved successfully',
      data: members,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching team members.',
    });
  }
};
