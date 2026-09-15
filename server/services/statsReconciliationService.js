const { pool } = require('../config/db');

/**
 * Reconciles stored user statistics (leetcode_total_solved, leetcode_easy_solved, etc.)
 * using unique problem counting: COUNT(DISTINCT problem_slug) per user and per difficulty.
 */
async function reconcileUserStats(userId) {
  // Query unique submissions for the user
  const [submissions] = await pool.query(
    `SELECT DISTINCT problem_slug, difficulty 
     FROM leetcode_submissions 
     WHERE user_id = ?`,
    [userId]
  );

  const totalSolved = submissions.length;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  submissions.forEach((s) => {
    const diff = s.difficulty ? s.difficulty.toUpperCase() : '';
    if (diff === 'EASY') easySolved++;
    else if (diff === 'MEDIUM') mediumSolved++;
    else if (diff === 'HARD') hardSolved++;
  });

  await pool.query(
    `UPDATE users 
     SET leetcode_total_solved = ?,
         leetcode_easy_solved = ?,
         leetcode_medium_solved = ?,
         leetcode_hard_solved = ?
     WHERE id = ?`,
    [totalSolved, easySolved, mediumSolved, hardSolved, userId]
  );

  return { totalSolved, easySolved, mediumSolved, hardSolved };
}

/**
 * Reconciles all connected MEMBER accounts in the database.
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
