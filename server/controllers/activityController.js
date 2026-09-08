const { pool } = require('../config/db');
const leetcodeService = require('../services/leetcodeService');

exports.getMyActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's connected LeetCode username and stored last activity timestamp
    const [users] = await pool.query(
      'SELECT leetcode_username, leetcode_last_activity FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].leetcode_username) {
      return res.status(400).json({
        success: false,
        message: 'LeetCode account is not connected',
      });
    }

    const username = users[0].leetcode_username;
    let storedLastActivity = users[0].leetcode_last_activity;

    // Fetch recent accepted submissions from LeetCode service
    const submissions = await leetcodeService.getRecentLeetCodeActivity(username);

    let latestTimestamp = storedLastActivity ? new Date(storedLastActivity).getTime() : null;

    // If recent accepted submissions exist, update stored DB timestamp with the newest one
    if (submissions.length > 0 && submissions[0].timestamp) {
      latestTimestamp = submissions[0].timestamp;
      const latestDate = new Date(latestTimestamp);

      await pool.query(
        'UPDATE users SET leetcode_last_activity = ? WHERE id = ?',
        [latestDate, userId]
      );
    }

    // Calculate activity status
    let status = 'NO ACTIVITY';
    let lastActivityIso = null;

    if (latestTimestamp) {
      lastActivityIso = new Date(latestTimestamp).toISOString();
      const diffMs = Date.now() - latestTimestamp;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        status = 'ACTIVE';
      } else {
        status = 'INACTIVE';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        status,
        lastActivity: lastActivityIso,
        submissions,
      },
    });
  } catch (error) {
    console.error('getMyActivity controller error:', error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Unable to load recent LeetCode activity.',
    });
  }
};
