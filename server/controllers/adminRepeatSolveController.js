const { pool } = require('../config/db');

/**
 * ADMIN ONLY: Get Repeat Solves
 * Detects accepted submissions where a member solved the same problem at distinct timestamps.
 * Route: GET /api/admin/repeat-solves
 */
exports.getRepeatSolves = async (req, res) => {
  try {
    const {
      search = '',
      teamId = '',
      difficulty = '',
      startDate = '',
      endDate = '',
      sortBy = 'latestSolve', // 'latestSolve' | 'repeatCount' | 'earliestSolve' | 'name'
      sortOrder = 'DESC', // 'DESC' | 'ASC'
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const offset = (pageNum - 1) * limitNum;

    // 1. Build Base Where Clauses for Filter
    let whereClauses = [];
    let params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereClauses.push(
        `(u.name LIKE ? OR u.leetcode_username LIKE ? OR s.problem_title LIKE ? OR s.problem_slug LIKE ?)`
      );
      params.push(term, term, term, term);
    }

    if (teamId && teamId.trim()) {
      whereClauses.push(`tm.team_id = ?`);
      params.push(parseInt(teamId.trim(), 10));
    }

    if (difficulty && difficulty.trim() && difficulty.toUpperCase() !== 'ALL') {
      whereClauses.push(`s.difficulty = ?`);
      params.push(difficulty.trim().toUpperCase());
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // 2. Main query to find (user_id, problem_slug) with distinct solve timestamps > 1
    const baseQuery = `
      SELECT 
        s.user_id,
        u.name as member_name,
        u.leetcode_username,
        t.name as team_name,
        s.problem_title,
        s.problem_slug,
        MAX(s.difficulty) as difficulty,
        GROUP_CONCAT(DISTINCT s.language ORDER BY s.solved_at DESC SEPARATOR ', ') as languages,
        MIN(s.solved_at) as earliest_solve,
        MAX(s.solved_at) as latest_solve,
        COUNT(DISTINCT s.solved_at) as total_solves_count,
        (COUNT(DISTINCT s.solved_at) - 1) as repeat_count
      FROM leetcode_submissions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN team_members tm ON u.id = tm.user_id
      LEFT JOIN teams t ON tm.team_id = t.id
      ${whereSql}
      GROUP BY s.user_id, s.problem_slug, s.problem_title, u.name, u.leetcode_username, t.name
      HAVING COUNT(DISTINCT s.solved_at) > 1
    `;

    // Wrap in outer query to allow date filtering on earliest/latest solves and clean sorting
    let outerWhere = [];
    let outerParams = [...params];

    if (startDate && startDate.trim()) {
      outerWhere.push(`latest_solve >= ?`);
      outerParams.push(`${startDate.trim()} 00:00:00`);
    }

    if (endDate && endDate.trim()) {
      outerWhere.push(`latest_solve <= ?`);
      outerParams.push(`${endDate.trim()} 23:59:59`);
    }

    const outerWhereSql = outerWhere.length > 0 ? `WHERE ${outerWhere.join(' AND ')}` : '';

    // Determine Sort Field
    let orderColumn = 'latest_solve';
    if (sortBy === 'repeatCount') orderColumn = 'repeat_count';
    else if (sortBy === 'earliestSolve') orderColumn = 'earliest_solve';
    else if (sortBy === 'name') orderColumn = 'member_name';
    else if (sortBy === 'problem') orderColumn = 'problem_title';

    const cleanOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count Total Matching Repeat Problems
    const countQuery = `
      SELECT COUNT(*) as total_count FROM (
        ${baseQuery}
      ) as sub
      ${outerWhereSql}
    `;

    const [countRows] = await pool.query(countQuery, outerParams);
    const totalItems = countRows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    // Fetch Paginated Results
    const dataQuery = `
      SELECT * FROM (
        ${baseQuery}
      ) as sub
      ${outerWhereSql}
      ORDER BY ${orderColumn} ${cleanOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataQuery, [...outerParams, limitNum, offset]);

    // 3. For each returned repeat problem, fetch all distinct solve timestamps with language
    const items = await Promise.all(
      rows.map(async (row) => {
        const [timestamps] = await pool.query(
          `SELECT solved_at, language, difficulty 
           FROM leetcode_submissions 
           WHERE user_id = ? AND problem_slug = ? 
           GROUP BY solved_at, language, difficulty
           ORDER BY solved_at ASC`,
          [row.user_id, row.problem_slug]
        );

        return {
          userId: row.user_id,
          memberName: row.member_name,
          leetcodeUsername: row.leetcode_username,
          teamName: row.team_name || 'No Team',
          problemTitle: row.problem_title,
          problemSlug: row.problem_slug,
          difficulty: row.difficulty || 'UNKNOWN',
          languages: row.languages ? row.languages.split(', ') : [],
          earliestSolve: row.earliest_solve,
          latestSolve: row.latest_solve,
          totalSolvesCount: row.total_solves_count,
          repeatCount: row.repeat_count,
          solvesHistory: timestamps.map((ts, idx) => ({
            solveNumber: idx + 1,
            isFirstSolve: idx === 0,
            isRepeat: idx > 0,
            solvedAt: ts.solved_at,
            language: ts.language || 'Unknown',
            difficulty: ts.difficulty || row.difficulty,
          })),
        };
      })
    );

    // 4. Compute High-Level Summary Statistics across entire database
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_repeat_instances,
        COUNT(DISTINCT user_id) as members_with_repeats,
        COALESCE(SUM(total_solves - 1), 0) as total_extra_repeats
      FROM (
        SELECT user_id, problem_slug, COUNT(DISTINCT solved_at) as total_solves
        FROM leetcode_submissions
        GROUP BY user_id, problem_slug
        HAVING COUNT(DISTINCT solved_at) > 1
      ) as repeats_all
    `);

    // Top repeated problem
    const [topRepeatedRows] = await pool.query(`
      SELECT problem_title, problem_slug, COUNT(DISTINCT user_id) as users_count, SUM(solves_count - 1) as total_repeats
      FROM (
        SELECT problem_title, problem_slug, user_id, COUNT(DISTINCT solved_at) as solves_count
        FROM leetcode_submissions
        GROUP BY problem_title, problem_slug, user_id
        HAVING COUNT(DISTINCT solved_at) > 1
      ) as t
      GROUP BY problem_title, problem_slug
      ORDER BY total_repeats DESC
      LIMIT 1
    `);

    const summary = {
      totalRepeatInstances: summaryRows[0]?.total_repeat_instances || 0,
      membersWithRepeats: summaryRows[0]?.members_with_repeats || 0,
      totalExtraRepeats: Number(summaryRows[0]?.total_extra_repeats) || 0,
      mostRepeatedProblem: topRepeatedRows[0]
        ? {
            title: topRepeatedRows[0].problem_title,
            slug: topRepeatedRows[0].problem_slug,
            repeats: Number(topRepeatedRows[0].total_repeats),
            usersCount: topRepeatedRows[0].users_count,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: {
        summary,
        items,
        pagination: {
          total: totalItems,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
        historyLimitation:
          'LeetCode public GraphQL API provides up to the latest 20 accepted submissions per member. Historical submissions prior to platform sync cannot be retroactively retrieved.',
      },
    });
  } catch (error) {
    console.error('getRepeatSolves error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch repeat solves.',
    });
  }
};
