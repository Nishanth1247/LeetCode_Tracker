const { pool } = require('../config/db');
const { PROBLEM_BANK, SLUG_METADATA_MAP } = require('../services/problemBank');

/**
 * GET /api/recommendations/me
 * Member-protected endpoint to get personalized practice suggestions based on solved problem history.
 */
exports.getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch authenticated user's solved submissions ordered by recency
    const [userSubs] = await pool.query(
      `SELECT problem_title as title, problem_slug as slug, difficulty, solved_at as solvedAt
       FROM leetcode_submissions
       WHERE user_id = ?
       ORDER BY solved_at DESC`,
      [userId]
    );

    if (!userSubs || userSubs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          reason: 'NO_SOLVED_HISTORY',
        },
      });
    }

    // Set of solved slugs to exclude
    const solvedSlugSet = new Set(userSubs.map((s) => s.slug).filter(Boolean));

    // Enrich solved problems with tags from problemBank if available, or fallback tags based on difficulty/title
    const solvedWithMeta = userSubs.map((sub, idx) => {
      const bankEntry = SLUG_METADATA_MAP[sub.slug];
      let tags = bankEntry ? bankEntry.tags : [];
      
      // Heuristic fallback tags if slug not in bank
      if (tags.length === 0) {
        const lowerTitle = (sub.title || '').toLowerCase();
        if (lowerTitle.includes('sum') || lowerTitle.includes('array')) tags.push('Array');
        if (lowerTitle.includes('string') || lowerTitle.includes('anagram') || lowerTitle.includes('palindrome')) tags.push('String');
        if (lowerTitle.includes('tree') || lowerTitle.includes('bst')) tags.push('Tree');
        if (lowerTitle.includes('list')) tags.push('Linked List');
        if (tags.length === 0) tags.push('Array', 'Hash Table');
      }

      const diff = (sub.difficulty || (bankEntry ? bankEntry.difficulty : 'EASY')).toUpperCase();
      // Recency weight: 1.0 for most recent, decreasing for older ones
      const recencyWeight = Math.max(0.2, 1.0 - idx * 0.05);

      return {
        title: sub.title || bankEntry?.title || sub.slug,
        slug: sub.slug,
        difficulty: diff,
        tags,
        recencyWeight,
      };
    });

    // Difficulty preference mapping
    const getDiffBonus = (targetDiff, solvedDiff) => {
      const s = solvedDiff.toUpperCase();
      const t = targetDiff.toUpperCase();
      if (s === 'EASY') {
        if (t === 'EASY') return 3;
        if (t === 'MEDIUM') return 2;
        return 0;
      }
      if (s === 'MEDIUM') {
        if (t === 'MEDIUM') return 3;
        if (t === 'HARD') return 2;
        if (t === 'EASY') return 1;
        return 0;
      }
      if (s === 'HARD') {
        if (t === 'HARD') return 3;
        if (t === 'MEDIUM') return 2;
        return 0;
      }
      return 1;
    };

    // Score candidates from PROBLEM_BANK
    const candidateScores = new Map();

    for (const candidate of PROBLEM_BANK) {
      if (solvedSlugSet.has(candidate.slug)) {
        continue; // Strictly exclude already solved problems
      }

      let bestScore = 0;
      let bestMatchSolved = null;

      for (const solved of solvedWithMeta) {
        // Tag overlap count
        const commonTags = candidate.tags.filter((tag) => solved.tags.includes(tag));
        if (commonTags.length === 0) continue;

        const tagScore = commonTags.length * 5;
        const diffBonus = getDiffBonus(candidate.difficulty, solved.difficulty);
        const totalMatchScore = (tagScore + diffBonus) * solved.recencyWeight;

        if (totalMatchScore > bestScore) {
          bestScore = totalMatchScore;
          bestMatchSolved = solved;
        }
      }

      if (bestScore > 0 && bestMatchSolved) {
        candidateScores.set(candidate.slug, {
          candidate,
          score: bestScore,
          similarTo: {
            title: bestMatchSolved.title,
            slug: bestMatchSolved.slug,
          },
        });
      }
    }

    // Sort candidates by total score descending
    const sortedSuggestions = Array.from(candidateScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ candidate, similarTo }) => ({
        title: candidate.title,
        slug: candidate.slug,
        difficulty: candidate.difficulty,
        tags: candidate.tags,
        similarTo,
        leetcodeUrl: `https://leetcode.com/problems/${candidate.slug}/`,
      }));

    return res.status(200).json({
      success: true,
      data: {
        suggestions: sortedSuggestions,
      },
    });
  } catch (error) {
    console.error('getMyRecommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch practice suggestions.',
    });
  }
};
