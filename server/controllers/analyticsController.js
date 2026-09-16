const { pool } = require('../config/db');
const { calculateWeeklyInactivity } = require('../services/activityService');

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

    // 4. Calculate weekly inactivity (Mon-Sun)
    const { inactiveDays } = calculateWeeklyInactivity(dateSet);

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
        inactiveDays,
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

// Helper function to format YYYY-MM-DD safely
function isValidDateStr(dStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dStr);
}

// GET /api/analytics/me/daily?date=YYYY-MM-DD — Member Daily Analytics
exports.getDailyAnalyticsMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let { date } = req.query;

    if (!date || !isValidDateStr(date)) {
      date = new Date().toISOString().split('T')[0];
    }

    const targetDate = new Date(date + 'T00:00:00Z');
    const nextDateObj = new Date(targetDate);
    nextDateObj.setUTCDate(nextDateObj.getUTCDate() + 1);
    const nextDateStr = nextDateObj.toISOString().split('T')[0];

    const startBoundary = `${date} 00:00:00`;
    const endBoundary = `${nextDateStr} 00:00:00`;

    // Fetch submissions for this day
    const [submissions] = await pool.query(
      `SELECT problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at < ?
       ORDER BY solved_at DESC`,
      [userId, startBoundary, endBoundary]
    );

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const formattedSubmissions = submissions.map((s) => {
      const diffUpper = (s.difficulty || 'EASY').toUpperCase();
      if (diffUpper === 'EASY') easyCount++;
      else if (diffUpper === 'MEDIUM') mediumCount++;
      else if (diffUpper === 'HARD') hardCount++;

      return {
        title: s.title || s.slug,
        slug: s.slug,
        difficulty: diffUpper,
        language: s.language || 'N/A',
        solvedAt: s.solvedAt ? new Date(s.solvedAt).toISOString() : new Date().toISOString(),
      };
    });

    const problemsSolved = formattedSubmissions.length;
    const totalPoints = easyCount * 1 + mediumCount * 2.5 + hardCount * 5;

    return res.status(200).json({
      success: true,
      data: {
        date,
        summary: {
          problemsSolved,
          easyCount,
          mediumCount,
          hardCount,
          totalPoints,
        },
        submissions: formattedSubmissions,
      },
    });
  } catch (error) {
    console.error('getDailyAnalyticsMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch daily analytics.',
    });
  }
};

// GET /api/analytics/me/week?startDate=YYYY-MM-DD — Member Week Analytics
exports.getWeekAnalyticsMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let { startDate } = req.query;

    let monday;
    if (startDate && isValidDateStr(startDate)) {
      monday = new Date(startDate + 'T00:00:00Z');
    } else {
      const now = new Date();
      const day = now.getUTCDay(); // 0 is Sun, 1 is Mon...
      const diffToMon = (day === 0 ? -6 : 1 - day);
      monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() + diffToMon);
    }

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      weekDays.push({
        date: dateStr,
        dayName: dayNames[i],
        dayNumber: d.getUTCDate(),
      });
    }

    const weekStartStr = weekDays[0].date + ' 00:00:00';
    const weekEndObj = new Date(weekDays[6].date + 'T00:00:00Z');
    weekEndObj.setUTCDate(weekEndObj.getUTCDate() + 1);
    const weekEndStr = weekEndObj.toISOString().split('T')[0] + ' 00:00:00';

    const [subs] = await pool.query(
      `SELECT DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate, COUNT(*) as count
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at < ?
       GROUP BY solveDate`,
      [userId, weekStartStr, weekEndStr]
    );

    const countMap = {};
    subs.forEach((row) => {
      countMap[row.solveDate] = parseInt(row.count, 10) || 0;
    });

    const days = weekDays.map((wd) => ({
      date: wd.date,
      dayName: wd.dayName,
      dayNumber: wd.dayNumber,
      solvedCount: countMap[wd.date] || 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        startDate: weekDays[0].date,
        endDate: weekDays[6].date,
        days,
      },
    });
  } catch (error) {
    console.error('getWeekAnalyticsMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly analytics.',
    });
  }
};

// GET /api/analytics/admin/member-daily?userId=X&date=YYYY-MM-DD — Admin Member Daily Analytics
exports.getAdminMemberDailyAnalytics = async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId parameter is required.',
      });
    }

    let targetDateStr = date;
    if (!targetDateStr || !isValidDateStr(targetDateStr)) {
      targetDateStr = new Date().toISOString().split('T')[0];
    }

    // Verify member exists
    const [users] = await pool.query(
      `SELECT id, name, leetcode_username FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    const targetDate = new Date(targetDateStr + 'T00:00:00Z');
    const nextDateObj = new Date(targetDate);
    nextDateObj.setUTCDate(nextDateObj.getUTCDate() + 1);
    const nextDateStr = nextDateObj.toISOString().split('T')[0];

    const startBoundary = `${targetDateStr} 00:00:00`;
    const endBoundary = `${nextDateStr} 00:00:00`;

    const [submissions] = await pool.query(
      `SELECT problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at < ?
       ORDER BY solved_at DESC`,
      [userId, startBoundary, endBoundary]
    );

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const formattedSubmissions = submissions.map((s) => {
      const diffUpper = (s.difficulty || 'EASY').toUpperCase();
      if (diffUpper === 'EASY') easyCount++;
      else if (diffUpper === 'MEDIUM') mediumCount++;
      else if (diffUpper === 'HARD') hardCount++;

      return {
        title: s.title || s.slug,
        slug: s.slug,
        difficulty: diffUpper,
        language: s.language || 'N/A',
        solvedAt: s.solvedAt ? new Date(s.solvedAt).toISOString() : new Date().toISOString(),
      };
    });

    const problemsSolved = formattedSubmissions.length;
    const totalPoints = easyCount * 1 + mediumCount * 2.5 + hardCount * 5;

    return res.status(200).json({
      success: true,
      data: {
        member: {
          id: users[0].id,
          name: users[0].name,
          username: users[0].leetcode_username,
        },
        date: targetDateStr,
        summary: {
          problemsSolved,
          easyCount,
          mediumCount,
          hardCount,
          totalPoints,
        },
        submissions: formattedSubmissions,
      },
    });
  } catch (error) {
    console.error('getAdminMemberDailyAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member daily analytics.',
    });
  }
};

// GET /api/analytics/team-daily?teamId=X&date=YYYY-MM-DD — Admin & Team Leader Team Daily Analytics
exports.getTeamDailyAnalytics = async (req, res) => {
  try {
    const { teamId, date } = req.query;

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'teamId parameter is required.',
      });
    }

    let targetDateStr = date;
    if (!targetDateStr || !isValidDateStr(targetDateStr)) {
      targetDateStr = new Date().toISOString().split('T')[0];
    }

    // Verify team and authorization
    const [teams] = await pool.query(
      `SELECT id, name, leader_id FROM teams WHERE id = ?`,
      [teamId]
    );

    if (teams.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team not found.',
      });
    }

    const team = teams[0];
    const isUserAdmin = req.user.role === 'ADMIN';
    const isTeamLeader = team.leader_id === req.user.id;

    if (!isUserAdmin && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Admins and the Team Leader can view team daily analytics.',
      });
    }

    // Fetch team members
    const [members] = await pool.query(
      `SELECT u.id, u.name, u.leetcode_username as username
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ? AND u.role = 'MEMBER'`,
      [teamId]
    );

    const memberIds = members.map((m) => m.id);

    const targetDate = new Date(targetDateStr + 'T00:00:00Z');
    const nextDateObj = new Date(targetDate);
    nextDateObj.setUTCDate(nextDateObj.getUTCDate() + 1);
    const nextDateStr = nextDateObj.toISOString().split('T')[0];

    const startBoundary = `${targetDateStr} 00:00:00`;
    const endBoundary = `${nextDateStr} 00:00:00`;

    let memberStatsMap = {};
    members.forEach((m) => {
      memberStatsMap[m.id] = {
        id: m.id,
        name: m.name,
        username: m.username,
        problemsSolved: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        totalPoints: 0,
      };
    });

    if (memberIds.length > 0) {
      const [submissions] = await pool.query(
        `SELECT user_id, difficulty
         FROM leetcode_submissions
         WHERE user_id IN (?) AND solved_at >= ? AND solved_at < ?`,
        [memberIds, startBoundary, endBoundary]
      );

      submissions.forEach((s) => {
        const mStat = memberStatsMap[s.user_id];
        if (mStat) {
          mStat.problemsSolved++;
          const diffUpper = (s.difficulty || 'EASY').toUpperCase();
          if (diffUpper === 'EASY') mStat.easyCount++;
          else if (diffUpper === 'MEDIUM') mStat.mediumCount++;
          else if (diffUpper === 'HARD') mStat.hardCount++;
        }
      });

      // Calculate points
      Object.values(memberStatsMap).forEach((mStat) => {
        mStat.totalPoints = mStat.easyCount * 1 + mStat.mediumCount * 2.5 + mStat.hardCount * 5;
      });
    }

    const memberBreakdown = Object.values(memberStatsMap);

    let teamTotalSolved = 0;
    let teamEasyCount = 0;
    let teamMediumCount = 0;
    let teamHardCount = 0;
    let teamTotalPoints = 0;

    memberBreakdown.forEach((mb) => {
      teamTotalSolved += mb.problemsSolved;
      teamEasyCount += mb.easyCount;
      teamMediumCount += mb.mediumCount;
      teamHardCount += mb.hardCount;
      teamTotalPoints += mb.totalPoints;
    });

    return res.status(200).json({
      success: true,
      data: {
        team: {
          id: team.id,
          name: team.name,
        },
        date: targetDateStr,
        summary: {
          teamTotalSolved,
          teamEasyCount,
          teamMediumCount,
          teamHardCount,
          teamTotalPoints,
        },
        memberBreakdown,
      },
    });
  } catch (error) {
    console.error('getTeamDailyAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team daily analytics.',
    });
  }
};

