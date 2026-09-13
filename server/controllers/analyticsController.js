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

exports.getMyPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch user total solved stats
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
    const totalSolved = u.leetcode_total_solved || 0;

    // 2. Fetch submission dates
    const now = new Date();
    const nowMs = now.getTime();

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] + ' 00:00:00';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';

    // Start of Week (last 7 days)
    const sevenDaysAgo = new Date(nowMs - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';

    const [monthlySubs] = await pool.query(
      `SELECT COUNT(DISTINCT problem_slug) as count
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?`,
      [userId, startOfMonth, endOfMonth]
    );
    const solvedThisMonth = monthlySubs[0]?.count || 0;

    const [weeklySubs] = await pool.query(
      `SELECT COUNT(DISTINCT problem_slug) as count
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ?`,
      [userId, sevenDaysAgo]
    );
    const solvedThisWeek = weeklySubs[0]?.count || 0;

    // Active days this month
    const [activeDaysRows] = await pool.query(
      `SELECT COUNT(DISTINCT DATE_FORMAT(solved_at, '%Y-%m-%d')) as activeDays
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?`,
      [userId, startOfMonth, endOfMonth]
    );
    const activeDaysThisMonth = activeDaysRows[0]?.activeDays || 0;

    const avgProblemsPerActiveDay = activeDaysThisMonth > 0 ? Math.round((solvedThisMonth / activeDaysThisMonth) * 10) / 10 : 0;

    // 3. Calculate streak metrics using all submission dates
    const [subDates] = await pool.query(
      `SELECT DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
       FROM leetcode_submissions
       WHERE user_id = ?
       GROUP BY solveDate
       ORDER BY solveDate ASC`,
      [userId]
    );

    const datesAsc = subDates.map((s) => s.solveDate);
    const uniqueDates = [...new Set(datesAsc)].sort();

    // Streak calculation
    let longestStreak = 0;
    let currentRun = 0;
    let prevDateMs = null;

    for (const dStr of uniqueDates) {
      const dMs = new Date(dStr + 'T00:00:00').getTime();
      if (prevDateMs === null) {
        currentRun = 1;
      } else {
        const diffDays = Math.round((dMs - prevDateMs) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) currentRun++;
        else currentRun = 1;
      }
      if (currentRun > longestStreak) longestStreak = currentRun;
      prevDateMs = dMs;
    }

    const dateSet = new Set(uniqueDates);
    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    const yesterdayObj = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let currentStreak = 0;
    const activeToday = dateSet.has(todayStr);
    let checkDate = activeToday ? todayObj : yesterdayObj;

    if (dateSet.has(checkDate.toISOString().split('T')[0])) {
      let curr = new Date(checkDate);
      while (dateSet.has(curr.toISOString().split('T')[0])) {
        currentStreak++;
        curr.setDate(curr.getDate() - 1);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalSolved,
        solvedThisMonth,
        solvedThisWeek,
        currentStreak,
        longestStreak,
        activeDaysThisMonth,
        avgProblemsPerActiveDay,
      },
    });
  } catch (error) {
    console.error('getMyPerformance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch performance summary.',
    });
  }
};
