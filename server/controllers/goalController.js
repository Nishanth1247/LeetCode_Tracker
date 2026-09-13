const { pool } = require('../config/db');

// GET /api/goals/me — Get member's personal goals & current progress
exports.getMyGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch member goal from user_goals table
    const [goals] = await pool.query(
      'SELECT monthly_problem_goal, daily_problem_goal FROM user_goals WHERE user_id = ?',
      [userId]
    );

    const monthlyGoal = goals.length > 0 ? goals[0].monthly_problem_goal : null;
    const dailyGoal = goals.length > 0 ? goals[0].daily_problem_goal : null;

    // Calculate unique problem progress from leetcode_submissions
    // 1. Monthly progress (unique problem_slug solved in current calendar month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] + ' 00:00:00';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';

    const [monthlySubs] = await pool.query(
      `SELECT COUNT(DISTINCT problem_slug) as count
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?`,
      [userId, startOfMonth, endOfMonth]
    );
    const monthlySolved = monthlySubs[0]?.count || 0;

    // 2. Daily progress (unique problem_slug solved today)
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = `${todayStr} 00:00:00`;
    const endOfToday = `${todayStr} 23:59:59`;

    const [dailySubs] = await pool.query(
      `SELECT COUNT(DISTINCT problem_slug) as count
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?`,
      [userId, startOfToday, endOfToday]
    );
    const dailySolved = dailySubs[0]?.count || 0;

    // Determine Status
    let monthlyStatus = 'NO GOAL';
    let dailyStatus = 'NO GOAL';

    if (monthlyGoal) {
      if (monthlySolved >= monthlyGoal) {
        monthlyStatus = 'COMPLETED';
      } else {
        // Expect proportional target based on day of month
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const expectedPacing = Math.round((monthlyGoal / daysInMonth) * dayOfMonth);

        if (monthlySolved >= expectedPacing) {
          monthlyStatus = 'ON TRACK';
        } else {
          monthlyStatus = 'NEEDS ATTENTION';
        }
      }
    }

    if (dailyGoal) {
      if (dailySolved >= dailyGoal) {
        dailyStatus = 'COMPLETED';
      } else {
        dailyStatus = 'NEEDS ATTENTION';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        hasGoal: Boolean(goals.length > 0),
        monthlyGoal,
        monthlySolved,
        monthlyRemaining: monthlyGoal ? Math.max(0, monthlyGoal - monthlySolved) : null,
        monthlyPercentage: monthlyGoal ? Math.min(100, Math.round((monthlySolved / monthlyGoal) * 100)) : 0,
        monthlyStatus,
        dailyGoal,
        dailySolved,
        dailyRemaining: dailyGoal ? Math.max(0, dailyGoal - dailySolved) : null,
        dailyPercentage: dailyGoal ? Math.min(100, Math.round((dailySolved / dailyGoal) * 100)) : 0,
        dailyStatus,
      },
    });
  } catch (error) {
    console.error('getMyGoals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal goals.',
    });
  }
};

// PUT /api/goals/me — Update member's personal goals
exports.updateMyGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthlyProblemGoal, dailyProblemGoal } = req.body;

    // Validate inputs
    const monthlyNum = parseInt(monthlyProblemGoal, 10);
    const dailyNum = parseInt(dailyProblemGoal, 10);

    if (isNaN(monthlyNum) || monthlyNum <= 0 || monthlyNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Monthly problem goal must be a positive integer up to 1000.',
      });
    }

    if (isNaN(dailyNum) || dailyNum <= 0 || dailyNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Daily problem goal must be a positive integer up to 50.',
      });
    }

    // Insert or Update goal record
    await pool.query(
      `INSERT INTO user_goals (user_id, monthly_problem_goal, daily_problem_goal)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         monthly_problem_goal = VALUES(monthly_problem_goal),
         daily_problem_goal = VALUES(daily_problem_goal)`,
      [userId, monthlyNum, dailyNum]
    );

    return res.status(200).json({
      success: true,
      message: 'Personal goals updated successfully.',
    });
  } catch (error) {
    console.error('updateMyGoals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update personal goals.',
    });
  }
};
