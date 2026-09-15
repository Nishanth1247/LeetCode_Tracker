const { pool } = require('../config/db');
const { normalizeLanguageName } = require('../services/statsReconciliationService');

// ADMIN ONLY: GET /api/admin/language-analytics/:userId
exports.getAdminMemberLanguageAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetId = parseInt(userId, 10);

    if (isNaN(targetId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID provided.',
      });
    }

    // 1. Verify target user exists and is MEMBER
    const [users] = await pool.query(
      'SELECT id, name, email, role, leetcode_username as leetcodeUsername FROM users WHERE id = ?',
      [targetId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member user not found.',
      });
    }

    const member = users[0];
    if (member.role === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Language analytics are only for MEMBER accounts.',
      });
    }

    // 2. Query earliest accepted submission for each unique (user_id, problem_slug)
    // Earliest solved_at (or lowest id) is the canonical solved submission for that problem
    const [submissions] = await pool.query(
      `SELECT s.problem_slug, s.language, s.solved_at
       FROM leetcode_submissions s
       INNER JOIN (
         SELECT user_id, problem_slug, MIN(solved_at) as first_solved_at
         FROM leetcode_submissions
         WHERE user_id = ?
         GROUP BY user_id, problem_slug
       ) earliest 
       ON s.user_id = earliest.user_id 
          AND s.problem_slug = earliest.problem_slug 
          AND s.solved_at = earliest.first_solved_at
       WHERE s.user_id = ?`,
      [targetId, targetId]
    );

    // Handle deduplication if multiple submissions have exact same timestamp
    const canonicalProbs = new Map();
    for (const sub of submissions) {
      if (!canonicalProbs.has(sub.problem_slug)) {
        canonicalProbs.set(sub.problem_slug, normalizeLanguageName(sub.language));
      }
    }

    const totalUniqueSolved = canonicalProbs.size;
    const languageCounts = {};

    for (const [, lang] of canonicalProbs) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }

    const languagesList = Object.keys(languageCounts).map((lang) => {
      const count = languageCounts[lang];
      const percentage = totalUniqueSolved > 0 ? Math.round((count / totalUniqueSolved) * 100) : 0;
      return {
        language: lang,
        count,
        percentage,
      };
    });

    // Sort languages by count DESC, then language ASC
    languagesList.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.language.localeCompare(b.language);
    });

    return res.status(200).json({
      success: true,
      message: 'Language analytics fetched successfully.',
      data: {
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          leetcodeUsername: member.leetcodeUsername || null,
        },
        totalUniqueSolved,
        languageCount: languagesList.length,
        languages: languagesList,
      },
    });
  } catch (error) {
    console.error('getAdminMemberLanguageAnalytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load language statistics.',
    });
  }
};
