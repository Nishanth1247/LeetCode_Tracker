const { pool } = require('../config/db');

// ADMIN ONLY: Get member historical solved problems by date range
exports.getAdminSubmissions = async (req, res) => {
  try {
    const { userId, from, to } = req.query;

    if (!userId || !from || !to) {
      return res.status(400).json({
        success: false,
        message: 'userId, from, and to parameters are required.',
      });
    }

    // Validate ISO date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Dates must be in YYYY-MM-DD format.',
      });
    }

    if (new Date(to) < new Date(from)) {
      return res.status(400).json({
        success: false,
        message: "'from' date cannot be after 'to' date.",
      });
    }

    // Check user existence and role = 'MEMBER'
    const [users] = await pool.query(
      'SELECT id, name, leetcode_username, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member user not found.',
      });
    }

    const memberUser = users[0];
    if (memberUser.role !== 'MEMBER') {
      return res.status(400).json({
        success: false,
        message: 'Submissions history can only be queried for MEMBER users.',
      });
    }

    // Inclusive date range
    const fromStr = `${from} 00:00:00`;
    const toStr = `${to} 23:59:59`;

    const [rows] = await pool.query(
      `SELECT problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt
       FROM leetcode_submissions
       WHERE user_id = ? AND solved_at >= ? AND solved_at <= ?
       ORDER BY solved_at DESC`,
      [userId, fromStr, toStr]
    );

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    const formattedProblems = rows.map((r) => {
      if (r.difficulty === 'EASY') easyCount++;
      if (r.difficulty === 'MEDIUM') mediumCount++;
      if (r.difficulty === 'HARD') hardCount++;

      return {
        title: r.title,
        slug: r.slug,
        difficulty: r.difficulty,
        language: r.language,
        solvedAt: new Date(r.solvedAt).toISOString(),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Solved problems fetched successfully.',
      data: {
        member: {
          id: memberUser.id,
          name: memberUser.name,
          leetcodeUsername: memberUser.leetcode_username,
        },
        dateRange: {
          from,
          to,
        },
        summary: {
          total: formattedProblems.length,
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
        },
        problems: formattedProblems,
      },
    });
  } catch (error) {
    console.error('getAdminSubmissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch solved problems history.',
    });
  }
};

// Helper: Calculate streak metrics from an array of YYYY-MM-DD date strings (sorted ascending)
function calculateStreakMetrics(datesAsc) {
  if (!datesAsc || datesAsc.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      activeToday: false,
      dailyActivity: [],
    };
  }

  const uniqueDates = [...new Set(datesAsc)].sort();
  const totalActiveDays = uniqueDates.length;

  // Get current date in YYYY-MM-DD (local application timezone)
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];
  
  // Yesterday in YYYY-MM-DD
  const yesterdayObj = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const activeToday = uniqueDates.includes(todayStr);

  // Longest streak calculation
  let longestStreak = 0;
  let currentRun = 0;
  let prevDateMs = null;

  for (const dStr of uniqueDates) {
    const dMs = new Date(dStr + 'T00:00:00').getTime();
    if (prevDateMs === null) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((dMs - prevDateMs) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
    prevDateMs = dMs;
  }

  // Current streak calculation (must include today or yesterday to be active)
  let currentStreak = 0;
  const dateSet = new Set(uniqueDates);

  let checkDate = activeToday ? todayObj : yesterdayObj;
  
  // If active today or yesterday, count backwards consecutive days
  if (dateSet.has(checkDate.toISOString().split('T')[0])) {
    let curr = new Date(checkDate);
    while (dateSet.has(curr.toISOString().split('T')[0])) {
      currentStreak++;
      curr.setDate(curr.getDate() - 1);
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    activeToday,
    dailyActivity: uniqueDates,
  };
}

// ADMIN ONLY: Get streak overview for all members
exports.getAdminStreaks = async (req, res) => {
  try {
    // Fetch all MEMBER role users with their team name if assigned
    const [members] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.leetcode_username as leetcodeUsername,
        t.name as teamName
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      WHERE u.role = 'MEMBER'
      ORDER BY u.name ASC
    `);

    if (members.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overview: {
            totalMembers: 0,
            activeToday: 0,
            avgCurrentStreak: 0,
            longestTeamStreak: 0,
          },
          members: [],
        },
      });
    }

    const memberIds = members.map((m) => m.id);

    // Fetch all submissions for all members grouped by user_id and DATE(solved_at)
    const [submissions] = await pool.query(
      `SELECT user_id, DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
       FROM leetcode_submissions
       WHERE user_id IN (?)
       GROUP BY user_id, solveDate
       ORDER BY solveDate ASC`,
      [memberIds]
    );

    // Map dates per user_id
    const userDatesMap = {};
    for (const sub of submissions) {
      if (!userDatesMap[sub.user_id]) {
        userDatesMap[sub.user_id] = [];
      }
      userDatesMap[sub.user_id].push(sub.solveDate);
    }

    let activeTodayCount = 0;
    let sumCurrentStreak = 0;
    let maxTeamStreak = 0;

    const memberStreakList = members.map((m) => {
      const dates = userDatesMap[m.id] || [];
      const metrics = calculateStreakMetrics(dates);

      if (metrics.activeToday) activeTodayCount++;
      sumCurrentStreak += metrics.currentStreak;
      if (metrics.longestStreak > maxTeamStreak) {
        maxTeamStreak = metrics.longestStreak;
      }

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        username: m.leetcodeUsername,
        teamName: m.teamName || 'Unassigned',
        activeToday: metrics.activeToday,
        currentStreak: metrics.currentStreak,
        longestStreak: metrics.longestStreak,
        totalActiveDays: metrics.totalActiveDays,
      };
    });

    const avgCurrentStreak = members.length > 0 ? Math.round((sumCurrentStreak / members.length) * 10) / 10 : 0;

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalMembers: members.length,
          activeToday: activeTodayCount,
          avgCurrentStreak,
          longestTeamStreak: maxTeamStreak,
        },
        members: memberStreakList,
      },
    });
  } catch (error) {
    console.error('getAdminStreaks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team streaks.',
    });
  }
};

// ADMIN ONLY: Get detailed streak & calendar info for a specific member
exports.getAdminMemberStreakDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.leetcode_username as leetcodeUsername, t.name as teamName
       FROM users u
       LEFT JOIN team_members tm ON u.id = tm.user_id
       LEFT JOIN teams t ON tm.team_id = t.id
       WHERE u.id = ? AND u.role = 'MEMBER'`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    const member = users[0];

    const [submissions] = await pool.query(
      `SELECT DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
       FROM leetcode_submissions
       WHERE user_id = ?
       GROUP BY solveDate
       ORDER BY solveDate ASC`,
      [userId]
    );

    const datesAsc = submissions.map((s) => s.solveDate);
    const metrics = calculateStreakMetrics(datesAsc);

    return res.status(200).json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          username: member.leetcodeUsername,
        },
        team: {
          name: member.teamName || 'Unassigned',
        },
        currentStreak: metrics.currentStreak,
        longestStreak: metrics.longestStreak,
        totalActiveDays: metrics.totalActiveDays,
        activeToday: metrics.activeToday,
        dailyActivity: metrics.dailyActivity,
      },
    });
  } catch (error) {
    console.error('getAdminMemberStreakDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member streak details.',
    });
  }
};
