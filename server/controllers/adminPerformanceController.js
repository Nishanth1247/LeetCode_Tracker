const { pool } = require('../config/db');
const { calculateWeeklyInactivity } = require('../services/activityService');

// Helper to calculate streak metrics for a single member
function calculateMemberStreak(datesAsc) {
  if (!datesAsc || datesAsc.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  const uniqueDates = [...new Set(datesAsc)].sort();
  const activeDays = uniqueDates.length;

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

  return { currentStreak, longestStreak, activeDays };
}

// GET /api/admin/team-performance — Admin Team Performance Comparison
exports.getAdminTeamPerformance = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] + ' 00:00:00';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';

    // 1. Fetch teams
    const [teams] = await pool.query(`
      SELECT t.id, t.name, COUNT(DISTINCT tm.user_id) as memberCount
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    // 2. Fetch all team members & submissions
    const [teamMembers] = await pool.query(`
      SELECT tm.team_id as teamId, u.id as userId, u.name, u.leetcode_username as leetcodeUsername
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE u.role = 'MEMBER'
    `);

    const [allSubmissions] = await pool.query(`
      SELECT user_id, problem_slug as slug, difficulty, solved_at as solvedAt, DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
      FROM leetcode_submissions
    `);

    const [challenges] = await pool.query(`
      SELECT id, team_id as teamId, target, difficulty, start_date as startDate, end_date as endDate, status
      FROM team_challenges
    `);

    const teamPerformanceList = teams.map((t) => {
      const members = teamMembers.filter((m) => m.teamId === t.id);
      const memberIds = members.map((m) => m.userId);

      // Submissions for this team
      const teamSubs = allSubmissions.filter((s) => memberIds.includes(s.user_id));

      // Total solved (unique problem_slug across all time)
      const totalSolvedSet = new Set(teamSubs.map((s) => s.slug));
      const totalSolved = totalSolvedSet.size;

      // Solved this month
      const startMs = new Date(startOfMonth).getTime();
      const endMs = new Date(endOfMonth).getTime();

      const monthlySubs = teamSubs.filter((s) => {
        const solvedMs = new Date(s.solvedAt).getTime();
        return solvedMs >= startMs && solvedMs <= endMs;
      });
      const solvedThisMonth = new Set(monthlySubs.map((s) => s.slug)).size;

      // Active members this month
      const activeMemberIdsThisMonth = new Set(monthlySubs.map((s) => s.user_id));
      const activeMembers = activeMemberIdsThisMonth.size;

      // Average problems per member
      const memberCount = parseInt(t.memberCount, 10) || 0;
      const avgProblemsPerMember = memberCount > 0 ? Math.round((solvedThisMonth / memberCount) * 10) / 10 : 0;

      // Average current streak
      let sumStreak = 0;
      members.forEach((m) => {
        const mDates = teamSubs.filter((s) => s.user_id === m.userId).map((s) => s.solveDate);
        const { currentStreak } = calculateMemberStreak(mDates);
        sumStreak += currentStreak;
      });
      const avgCurrentStreak = memberCount > 0 ? Math.round((sumStreak / memberCount) * 10) / 10 : 0;

      // Challenges & Challenge Completion %
      const teamActiveChallenges = challenges.filter((c) => {
        const endStr = new Date(c.endDate).toISOString().split('T')[0];
        const calcStatus = (todayStr > endStr && c.status !== 'COMPLETED') ? 'EXPIRED' : c.status;
        return c.teamId === t.id && calcStatus === 'ACTIVE';
      });

      let totalTarget = 0;
      let totalChallengeSolved = 0;

      teamActiveChallenges.forEach((c) => {
        totalTarget += c.target || 0;
        const cStartMs = new Date(new Date(c.startDate).toISOString().split('T')[0] + ' 00:00:00').getTime();
        const cEndMs = new Date(new Date(c.endDate).toISOString().split('T')[0] + ' 23:59:59').getTime();

        memberIds.forEach((uId) => {
          const mSubs = teamSubs.filter((s) => {
            const solvedMs = new Date(s.solvedAt).getTime();
            return s.user_id === uId && solvedMs >= cStartMs && solvedMs <= cEndMs;
          });

          const seenSlugs = new Set();
          mSubs.forEach((sub) => {
            if (!seenSlugs.has(sub.slug)) {
              seenSlugs.add(sub.slug);
              const diff = sub.difficulty ? sub.difficulty.toUpperCase() : null;
              let counts = false;
              if (c.difficulty === 'MIXED') counts = true;
              else if (c.difficulty === diff) counts = true;
              if (counts) totalChallengeSolved++;
            }
          });
        });
      });

      const challengeCompletionPct = totalTarget > 0 ? Math.min(100, Math.round((totalChallengeSolved / totalTarget) * 100)) : 100;

      // Score formula: 50% challenge completion + 30% monthly activity (capped at 50/member) + 20% active member ratio
      const activityScoreComponent = Math.min(100, (solvedThisMonth / Math.max(1, memberCount * 20)) * 100);
      const activeRatioComponent = memberCount > 0 ? (activeMembers / memberCount) * 100 : 0;

      const compositeScore = Math.round(
        0.5 * challengeCompletionPct + 0.3 * activityScoreComponent + 0.2 * activeRatioComponent
      );

      return {
        id: t.id,
        name: t.name,
        memberCount,
        totalSolved,
        solvedThisMonth,
        activeMembers,
        avgProblemsPerMember,
        avgCurrentStreak,
        activeChallenges: teamActiveChallenges.length,
        challengeCompletionPct,
        compositeScore,
      };
    });

    // Sort by compositeScore descending to assign team rank
    teamPerformanceList.sort((a, b) => b.compositeScore - a.compositeScore);

    const rankedTeams = teamPerformanceList.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    return res.status(200).json({
      success: true,
      data: rankedTeams,
    });
  } catch (error) {
    console.error('getAdminTeamPerformance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch team performance comparison.',
    });
  }
};

// GET /api/admin/member-performance — Admin Member Performance List
exports.getAdminMemberPerformance = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] + ' 00:00:00';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';

    // 1. Fetch MEMBER users
    const [members] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.leetcode_username as leetcodeUsername,
        u.leetcode_total_solved as totalSolved,
        u.leetcode_last_activity as lastActivity,
        t.name as teamName,
        g.monthly_problem_goal as monthlyGoal
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      LEFT JOIN user_goals g ON u.id = g.user_id
      WHERE u.role = 'MEMBER'
      ORDER BY u.name ASC
    `);

    // 2. Fetch submissions
    const [submissions] = await pool.query(`
      SELECT user_id, problem_slug as slug, solved_at as solvedAt, DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
      FROM leetcode_submissions
    `);

    const startMs = new Date(startOfMonth).getTime();
    const endMs = new Date(endOfMonth).getTime();

    const memberPerformanceList = members.map((m) => {
      const userSubs = submissions.filter((s) => s.user_id === m.id);

      // Monthly solved (unique problem_slugs in current month)
      const monthlySubs = userSubs.filter((s) => {
        const solvedMs = new Date(s.solvedAt).getTime();
        return solvedMs >= startMs && solvedMs <= endMs;
      });
      const solvedThisMonth = new Set(monthlySubs.map((s) => s.slug)).size;

      // Active days this month
      const activeDays = new Set(monthlySubs.map((s) => s.solveDate)).size;

      // Streaks
      const datesAsc = userSubs.map((s) => s.solveDate);
      const { currentStreak, longestStreak } = calculateMemberStreak(datesAsc);

      // Inactivity this week
      const dateSet = new Set(datesAsc.filter(Boolean));
      const { inactiveDays } = calculateWeeklyInactivity(dateSet);

      // Monthly Goal Progress
      const monthlyGoal = m.monthlyGoal || null;
      const monthlyGoalPct = monthlyGoal ? Math.min(100, Math.round((solvedThisMonth / monthlyGoal) * 100)) : null;

      // Performance Status Rule
      // EXCELLENT: >= 15 solved this month or >= 80% goal or streak >= 5
      // GOOD: >= 5 solved this month or streak >= 1
      // NEEDS ATTENTION: < 5 solved this month or last activity > 14 days ago
      let performanceStatus = 'GOOD';
      const daysSinceActivity = m.lastActivity ? (now.getTime() - new Date(m.lastActivity).getTime()) / (1000 * 60 * 60 * 24) : 999;

      if ((monthlyGoalPct && monthlyGoalPct >= 80) || solvedThisMonth >= 15 || currentStreak >= 5) {
        performanceStatus = 'EXCELLENT';
      } else if (solvedThisMonth < 3 || daysSinceActivity > 14) {
        performanceStatus = 'NEEDS ATTENTION';
      }

      return {
        id: m.id,
        name: m.name,
        email: m.email,
        teamName: m.teamName || 'Unassigned',
        leetcodeUsername: m.leetcodeUsername,
        totalSolved: m.totalSolved || 0,
        solvedThisMonth,
        activeDays,
        inactiveDays,
        currentStreak,
        longestStreak,
        monthlyGoal,
        monthlyGoalPct,
        lastActivity: m.lastActivity,
        performanceStatus,
      };
    });

    return res.status(200).json({
      success: true,
      data: memberPerformanceList,
    });
  } catch (error) {
    console.error('getAdminMemberPerformance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member performance list.',
    });
  }
};

// GET /api/admin/member-performance/:userId — Detailed Admin Member Performance View
exports.getAdminMemberPerformanceDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetId = parseInt(userId, 10);

    if (isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID provided.',
      });
    }

    // 1. Query user & team details safely
    const [users] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.role, u.leetcode_username as leetcodeUsername,
        u.leetcode_total_solved as totalSolved,
        u.leetcode_easy_solved as easySolved,
        u.leetcode_medium_solved as mediumSolved,
        u.leetcode_hard_solved as hardSolved,
        u.leetcode_last_activity as lastActivity,
        u.leetcode_last_synced as lastSynced,
        t.name as teamName
      FROM users u
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      WHERE u.id = ?
    `, [targetId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    const member = users[0];
    if (member.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Admin accounts cannot be inspected here.',
      });
    }

    // 2. Fetch user_goals separately with safe fallback if user_goals row or table is missing
    let monthlyGoal = null;
    let dailyGoal = null;
    try {
      const [goals] = await pool.query(
        'SELECT monthly_problem_goal, daily_problem_goal FROM user_goals WHERE user_id = ?',
        [targetId]
      );
      if (goals.length > 0) {
        monthlyGoal = goals[0].monthly_problem_goal;
        dailyGoal = goals[0].daily_problem_goal;
      }
    } catch (goalErr) {
      console.warn(`[getAdminMemberPerformanceDetail] Non-fatal user_goals query error for user ${targetId}:`, goalErr.message);
    }

    // 3. Fetch submissions safely
    const [submissions] = await pool.query(`
      SELECT problem_title as title, problem_slug as slug, difficulty, language, solved_at as solvedAt, DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
      FROM leetcode_submissions
      WHERE user_id = ?
      ORDER BY solved_at DESC
    `, [targetId]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] + ' 00:00:00';
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] + ' 23:59:59';
    const startMs = new Date(startOfMonth).getTime();
    const endMs = new Date(endOfMonth).getTime();

    const monthlySubs = submissions.filter((s) => {
      if (!s.solvedAt) return false;
      const solvedMs = new Date(s.solvedAt).getTime();
      return solvedMs >= startMs && solvedMs <= endMs;
    });

    const solvedThisMonth = new Set(monthlySubs.map((s) => s.slug).filter(Boolean)).size;

    const datesAsc = submissions.map((s) => s.solveDate).filter(Boolean);
    const { currentStreak, longestStreak } = calculateMemberStreak(datesAsc);

    const dateSet = new Set(datesAsc);
    const { inactiveDays, daysBreakdown } = calculateWeeklyInactivity(dateSet);

    return res.status(200).json({
      success: true,
      message: 'Member performance details fetched successfully.',
      data: {
        profile: {
          id: member.id,
          name: member.name,
          email: member.email,
          teamName: member.teamName || 'Unassigned',
          leetcodeUsername: member.leetcodeUsername || null,
          totalSolved: member.totalSolved || 0,
          easySolved: member.easySolved || 0,
          mediumSolved: member.mediumSolved || 0,
          hardSolved: member.hardSolved || 0,
          lastActivity: member.lastActivity || null,
          lastSynced: member.lastSynced || null,
        },
        streaks: {
          currentStreak: currentStreak || 0,
          longestStreak: longestStreak || 0,
        },
        inactivity: {
          inactiveDays: inactiveDays || 0,
          daysBreakdown: daysBreakdown || [],
        },
        goals: {
          monthlyGoal,
          monthlySolved: solvedThisMonth,
          monthlyPct: monthlyGoal ? Math.min(100, Math.round((solvedThisMonth / monthlyGoal) * 100)) : 0,
          dailyGoal,
        },
        recentSubmissions: (submissions || []).slice(0, 10).map((s) => ({
          title: s.title || 'Untitled Problem',
          slug: s.slug || '',
          difficulty: s.difficulty || 'MIXED',
          language: s.language || 'Code',
          solvedAt: s.solvedAt ? new Date(s.solvedAt).toISOString() : new Date().toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('getAdminMemberPerformanceDetail ERROR Traceback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member performance details.',
    });
  }
};
