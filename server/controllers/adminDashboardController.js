const { pool } = require('../config/db');
const autoSyncService = require('../services/autoSyncService');

// ADMIN ONLY: Single aggregated dashboard overview endpoint
exports.getAdminDashboard = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. KPI Overview Counts
    const [[memberStats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalMembers,
        COUNT(CASE WHEN leetcode_username IS NOT NULL AND TRIM(leetcode_username) != '' THEN 1 END) as connectedMembers
      FROM users 
      WHERE role = 'MEMBER'
    `);

    const [[teamStats]] = await pool.query('SELECT COUNT(*) as totalTeams FROM teams');

    const [challengesRaw] = await pool.query(`
      SELECT 
        c.id, c.team_id as teamId, t.name as teamName,
        c.title, c.description, c.difficulty, c.target,
        c.start_date as startDate, c.end_date as endDate,
        c.status, c.created_at as createdAt,
        c.assignment_type as assignmentType
      FROM team_challenges c
      JOIN teams t ON c.team_id = t.id
      WHERE c.assignment_type = 'TEAM' OR c.assignment_type IS NULL
      ORDER BY c.created_at DESC
    `);

    let activeChallengesCount = 0;
    let completedChallengesCount = 0;

    const formattedChallenges = challengesRaw.map((c) => {
      let calcStatus = c.status;
      const endStr = new Date(c.endDate).toISOString().split('T')[0];
      if (todayStr > endStr && c.status !== 'COMPLETED') {
        calcStatus = 'EXPIRED';
      }

      if (calcStatus === 'ACTIVE') activeChallengesCount++;
      if (calcStatus === 'COMPLETED') completedChallengesCount++;

      return {
        ...c,
        status: calcStatus,
      };
    });

    // 2. Teams & Team Performance Calculation
    const [rawTeams] = await pool.query(`
      SELECT 
        t.id, 
        t.name, 
        t.created_at as createdAt,
        COUNT(DISTINCT tm.user_id) as memberCount
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    // Fetch team members per team to accurately sum submission progress
    const [teamMembers] = await pool.query(`
      SELECT tm.team_id as teamId, tm.user_id as userId
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE u.role = 'MEMBER'
    `);

    const teamUserIdsMap = {};
    teamMembers.forEach((tm) => {
      if (!teamUserIdsMap[tm.teamId]) teamUserIdsMap[tm.teamId] = [];
      teamUserIdsMap[tm.teamId].push(tm.userId);
    });

    // Fetch all submissions for submission-based progress
    const [allSubmissions] = await pool.query(`
      SELECT user_id, problem_slug as slug, difficulty, solved_at as solvedAt
      FROM leetcode_submissions
    `);

    const teamsPerformance = rawTeams.map((t) => {
      const userIds = teamUserIdsMap[t.id] || [];
      const teamActiveChallenges = formattedChallenges.filter((c) => c.teamId === t.id && c.status === 'ACTIVE');
      const teamCompletedChallenges = formattedChallenges.filter((c) => c.teamId === t.id && c.status === 'COMPLETED');

      let totalTarget = 0;
      let totalSolved = 0;

      // Compute solved count per active challenge
      teamActiveChallenges.forEach((c) => {
        totalTarget += c.target || 0;

        if (userIds.length > 0) {
          const startDateStr = new Date(c.startDate).toISOString().split('T')[0] + ' 00:00:00';
          const endDateStr = new Date(c.endDate).toISOString().split('T')[0] + ' 23:59:59';
          const startMs = new Date(startDateStr).getTime();
          const endMs = new Date(endDateStr).getTime();

          userIds.forEach((uId) => {
            const memberSubs = allSubmissions.filter((s) => {
              const solvedMs = new Date(s.solvedAt).getTime();
              return s.user_id === uId && solvedMs >= startMs && solvedMs <= endMs;
            });

            const seenSlugs = new Set();
            memberSubs.forEach((sub) => {
              if (!seenSlugs.has(sub.slug)) {
                seenSlugs.add(sub.slug);
                const diff = sub.difficulty ? sub.difficulty.toUpperCase() : null;
                let counts = false;
                if (c.difficulty === 'MIXED') counts = true;
                else if (c.difficulty === diff) counts = true;
                if (counts) totalSolved++;
              }
            });
          });
        }
      });

      const remaining = Math.max(0, totalTarget - totalSolved);
      const percentage = totalTarget > 0 ? Math.min(100, Math.round((totalSolved / totalTarget) * 100)) : 0;

      return {
        id: t.id,
        name: t.name,
        memberCount: parseInt(t.memberCount, 10) || 0,
        activeChallengeCount: teamActiveChallenges.length,
        completedChallengeCount: teamCompletedChallenges.length,
        target: totalTarget,
        solved: totalSolved,
        remaining,
        percentage,
      };
    });

    // Sort teams by completion percentage descending
    teamsPerformance.sort((a, b) => b.percentage - a.percentage);

    // 3. Member Activity Overview
    const [membersRaw] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.leetcode_username as leetcodeUsername,
        u.leetcode_total_solved as leetcodeTotalSolved,
        u.leetcode_last_synced as leetcodeLastSynced,
        u.leetcode_last_activity as leetcodeLastActivity
      FROM users u
      WHERE u.role = 'MEMBER'
      ORDER BY u.name ASC
    `);

    // Fetch streak metrics using existing submission dates calculation logic
    const [subDates] = await pool.query(`
      SELECT user_id, DATE_FORMAT(solved_at, '%Y-%m-%d') as solveDate
      FROM leetcode_submissions
      GROUP BY user_id, solveDate
      ORDER BY solveDate ASC
    `);

    const userDatesMap = {};
    subDates.forEach((s) => {
      if (!userDatesMap[s.user_id]) userDatesMap[s.user_id] = [];
      userDatesMap[s.user_id].push(s.solveDate);
    });

    const membersActivityList = membersRaw.map((m) => {
      const dates = userDatesMap[m.id] || [];
      const uniqueDates = [...new Set(dates)].sort();

      // Current streak calculation
      const dateSet = new Set(uniqueDates);
      const todayObj = new Date();
      const todayStr = todayObj.toISOString().split('T')[0];
      const yesterdayObj = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

      const activeToday = dateSet.has(todayStr);
      let currentStreak = 0;
      let checkDate = activeToday ? todayObj : yesterdayObj;

      if (dateSet.has(checkDate.toISOString().split('T')[0])) {
        let curr = new Date(checkDate);
        while (dateSet.has(curr.toISOString().split('T')[0])) {
          currentStreak++;
          curr.setDate(curr.getDate() - 1);
        }
      }

      // Calculate activity status
      let activityStatus = 'NO ACTIVITY';
      if (m.leetcodeLastActivity) {
        const diffMs = Date.now() - new Date(m.leetcodeLastActivity).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        activityStatus = diffDays <= 7 ? 'ACTIVE' : 'INACTIVE';
      }

      return {
        id: m.id,
        name: m.name,
        leetcodeUsername: m.leetcodeUsername,
        totalSolved: m.leetcodeTotalSolved || 0,
        currentStreak,
        lastActivity: m.leetcodeLastActivity,
        lastSynced: m.leetcodeLastSynced,
        activityStatus,
      };
    });

    // 4. Automatic Sync Health Information
    const syncHealth = autoSyncService.getSyncStatus();

    // 5. Global Recent Submissions (Latest 10)
    const [recentSubmissions] = await pool.query(`
      SELECT 
        s.id,
        u.name as memberName,
        s.problem_title as title,
        s.problem_slug as slug,
        s.difficulty,
        s.language,
        s.solved_at as solvedAt
      FROM leetcode_submissions s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.solved_at DESC, s.id DESC
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalMembers: parseInt(memberStats.totalMembers, 10) || 0,
          connectedMembers: parseInt(memberStats.connectedMembers, 10) || 0,
          totalTeams: parseInt(teamStats.totalTeams, 10) || 0,
          activeChallenges: activeChallengesCount,
          completedChallenges: completedChallengesCount,
        },
        teams: teamsPerformance,
        challenges: formattedChallenges.slice(0, 10),
        members: membersActivityList,
        sync: {
          enabled: true,
          status: syncHealth.isSyncing ? 'Syncing' : 'Active',
          frequency: 'Every 1 hour',
          lastRun: syncHealth.lastRun,
          attempted: syncHealth.attempted,
          successful: syncHealth.successful,
          failed: syncHealth.failed,
          connectedMembers: parseInt(memberStats.connectedMembers, 10) || 0,
        },
        recentActivity: recentSubmissions.map((s) => ({
          id: s.id,
          memberName: s.memberName,
          title: s.title,
          slug: s.slug,
          difficulty: s.difficulty || 'MIXED',
          language: s.language || 'Code',
          solvedAt: s.solvedAt,
        })),
      },
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard overview data.',
    });
  }
};
