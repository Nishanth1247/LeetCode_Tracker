const { pool } = require('../config/db');

/**
 * Reconciles stored user statistics (leetcode_total_solved, leetcode_easy_solved, etc.)
 * Ensures that incomplete local submission history never overwrites or decreases an existing higher valid LeetCode solved total.
 */
async function reconcileUserStats(userId) {
  // 1. Fetch current stored stats from users table
  const [users] = await pool.query(
    `SELECT leetcode_total_solved, leetcode_easy_solved, leetcode_medium_solved, leetcode_hard_solved
     FROM users WHERE id = ?`,
    [userId]
  );

  if (users.length === 0) return null;
  const currentUser = users[0];

  // 2. Query unique submissions stored in leetcode_submissions for this user
  const [submissions] = await pool.query(
    `SELECT DISTINCT problem_slug, difficulty 
     FROM leetcode_submissions 
     WHERE user_id = ?`,
    [userId]
  );

  const localTotal = submissions.length;
  let localEasy = 0;
  let localMedium = 0;
  let localHard = 0;

  submissions.forEach((s) => {
    const diff = s.difficulty ? s.difficulty.toUpperCase() : '';
    if (diff === 'EASY') localEasy++;
    else if (diff === 'MEDIUM') localMedium++;
    else if (diff === 'HARD') localHard++;
  });

  // 3. Determine safe values:
  // Use local submission unique count IF local count is higher than current stored stats (e.g. accumulated history over time),
  // OR if current stored stats are null/0. Otherwise, preserve the official LeetCode stats provided directly by sync.
  const currentTotal = currentUser.leetcode_total_solved || 0;
  const currentEasy = currentUser.leetcode_easy_solved || 0;
  const currentMedium = currentUser.leetcode_medium_solved || 0;
  const currentHard = currentUser.leetcode_hard_solved || 0;

  const finalTotal = Math.max(currentTotal, localTotal);
  const finalEasy = Math.max(currentEasy, localEasy);
  const finalMedium = Math.max(currentMedium, localMedium);
  const finalHard = Math.max(currentHard, localHard);

  // 4. Update users table only if values changed
  if (
    finalTotal !== currentTotal ||
    finalEasy !== currentEasy ||
    finalMedium !== currentMedium ||
    finalHard !== currentHard
  ) {
    await pool.query(
      `UPDATE users 
       SET leetcode_total_solved = ?,
           leetcode_easy_solved = ?,
           leetcode_medium_solved = ?,
           leetcode_hard_solved = ?
       WHERE id = ?`,
      [finalTotal, finalEasy, finalMedium, finalHard, userId]
    );
  }

  return { totalSolved: finalTotal, easySolved: finalEasy, mediumSolved: finalMedium, hardSolved: finalHard };
}

/**
 * Reconciles all connected MEMBER accounts in the database safely.
 */
async function reconcileAllUsersStats() {
  const [members] = await pool.query(
    `SELECT id FROM users WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL`
  );

  for (const m of members) {
    await reconcileUserStats(m.id);
  }
}

/**
 * Language normalization helper. Maps raw language string to clean display name.
 */
function normalizeLanguageName(rawLang) {
  if (!rawLang || typeof rawLang !== 'string') return 'Unknown';
  const trimmed = rawLang.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'cpp' || lower === 'c++' || lower === 'cplusplus') return 'C++';
  if (lower === 'java') return 'Java';
  if (lower === 'python' || lower === 'python3' || lower === 'py') return 'Python';
  if (lower === 'javascript' || lower === 'js') return 'JavaScript';
  if (lower === 'typescript' || lower === 'ts') return 'TypeScript';
  if (lower === 'c') return 'C';
  if (lower === 'csharp' || lower === 'c#') return 'C#';
  if (lower === 'golang' || lower === 'go') return 'Go';
  if (lower === 'rust') return 'Rust';
  if (lower === 'kotlin') return 'Kotlin';
  if (lower === 'swift') return 'Swift';
  if (lower === 'ruby') return 'Ruby';
  if (lower === 'php') return 'PHP';
  if (lower === 'scala') return 'Scala';
  if (lower === 'sql' || lower === 'mysql' || lower === 'oracle' || lower === 'postgresql') return 'SQL';
  if (lower === 'shell' || lower === 'bash') return 'Shell';

  // Capitalize first letter as fallback
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

module.exports = {
  reconcileUserStats,
  reconcileAllUsersStats,
  normalizeLanguageName,
};
