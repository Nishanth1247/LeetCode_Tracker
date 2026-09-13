const { pool } = require('../config/db');
const leetcodeService = require('./leetcodeService');

// In-memory status for monitoring
let syncStatus = {
  lastRun: null,
  attempted: 0,
  successful: 0,
  failed: 0,
  isSyncing: false,
};

/**
 * Helper function to record a stats history snapshot ONLY if stats have changed.
 */
async function recordSnapshotIfChanged(userId, totalSolved, easySolved, mediumSolved, hardSolved) {
  try {
    const [latestSnapshots] = await pool.query(
      `SELECT total_solved, easy_solved, medium_solved, hard_solved 
       FROM leetcode_stats_history 
       WHERE user_id = ? 
       ORDER BY recorded_at DESC, id DESC 
       LIMIT 1`,
      [userId]
    );

    if (latestSnapshots.length > 0) {
      const latest = latestSnapshots[0];
      if (
        latest.total_solved === totalSolved &&
        latest.easy_solved === easySolved &&
        latest.medium_solved === mediumSolved &&
        latest.hard_solved === hardSolved
      ) {
        return;
      }
    }

    await pool.query(
      `INSERT INTO leetcode_stats_history (user_id, total_solved, easy_solved, medium_solved, hard_solved)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, totalSolved, easySolved, mediumSolved, hardSolved]
    );
  } catch (err) {
    console.error(`[AutoSync] Failed snapshot for user ${userId}:`, err.message);
  }
}

/**
 * Synchronize a single connected member safely.
 */
async function syncSingleMember(user) {
  const { id: userId, leetcode_username: username } = user;
  if (!username) return false;

  // 1. Fetch current LeetCode stats
  const stats = await leetcodeService.getLeetCodeStats(username);
  const now = new Date();

  // 2. Fetch recent activity to update leetcode_last_activity
  let lastActivityDate = null;
  try {
    const recentSubmissions = await leetcodeService.getRecentLeetCodeActivity(username);
    if (recentSubmissions.length > 0 && recentSubmissions[0].timestamp) {
      lastActivityDate = new Date(recentSubmissions[0].timestamp);
    }
  } catch (actErr) {
    // Non-fatal activity fetch error
  }

  // 3. Update user statistics & timestamps in DB
  if (lastActivityDate) {
    await pool.query(
      `UPDATE users 
       SET leetcode_total_solved = ?,
           leetcode_easy_solved = ?,
           leetcode_medium_solved = ?,
           leetcode_hard_solved = ?,
           leetcode_total_questions = ?,
           leetcode_ranking = ?,
           leetcode_last_synced = ?,
           leetcode_last_activity = ?
       WHERE id = ?`,
      [
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        now,
        lastActivityDate,
        userId,
      ]
    );
  } else {
    await pool.query(
      `UPDATE users 
       SET leetcode_total_solved = ?,
           leetcode_easy_solved = ?,
           leetcode_medium_solved = ?,
           leetcode_hard_solved = ?,
           leetcode_total_questions = ?,
           leetcode_ranking = ?,
           leetcode_last_synced = ?
       WHERE id = ?`,
      [
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        now,
        userId,
      ]
    );
  }

  // 4. Insert stats snapshot if changed
  await recordSnapshotIfChanged(
    userId,
    stats.totalSolved,
    stats.easySolved,
    stats.mediumSolved,
    stats.hardSolved
  );

  // 5. Sync submission history into leetcode_submissions
  try {
    const historySubmissions = await leetcodeService.getAcceptedSubmissionHistory(username);
    for (const sub of historySubmissions) {
      await pool.query(
        `INSERT INTO leetcode_submissions 
         (user_id, problem_title, problem_slug, difficulty, language, solved_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           difficulty = COALESCE(VALUES(difficulty), difficulty),
           language = COALESCE(VALUES(language), language),
           problem_title = COALESCE(VALUES(problem_title), problem_title)`,
        [userId, sub.problemTitle, sub.problemSlug, sub.difficulty, sub.language, sub.solvedAt]
      );
    }
  } catch (subErr) {
    console.error(`[AutoSync] Non-fatal submission sync error for user ID ${userId}:`, subErr.message);
  }

  return true;
}

/**
 * Main batch sync function: finds all connected MEMBER users and syncs them sequentially.
 */
async function syncAllConnectedMembers() {
  if (syncStatus.isSyncing) {
    console.log('[AutoSync] Sync already in progress, skipping concurrent run.');
    return syncStatus;
  }

  syncStatus.isSyncing = true;
  console.log('[AutoSync] Starting automatic LeetCode synchronization batch...');

  try {
    // Select all MEMBER users with a non-null leetcode_username
    const [members] = await pool.query(
      `SELECT id, name, leetcode_username 
       FROM users 
       WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL AND TRIM(leetcode_username) != ''`
    );

    let successCount = 0;
    let failCount = 0;

    for (const member of members) {
      try {
        console.log(`[AutoSync] Syncing member ${member.name} (@${member.leetcode_username})...`);
        await syncSingleMember(member);
        successCount++;
      } catch (err) {
        failCount++;
        // Safe logging - never log credentials, tokens, or sensitive headers
        console.error(`[AutoSync] Failed sync for member ID ${member.id} (@${member.leetcode_username}): ${err.message}`);
      }

      // Small delay between members to be respectful to upstream APIs
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    syncStatus = {
      lastRun: new Date().toISOString(),
      attempted: members.length,
      successful: successCount,
      failed: failCount,
      isSyncing: false,
    };

    console.log(`[AutoSync] Batch complete. Attempted: ${members.length}, Success: ${successCount}, Failed: ${failCount}`);
    return syncStatus;
  } catch (error) {
    console.error('[AutoSync] Batch execution error:', error.message);
    syncStatus.isSyncing = false;
    return syncStatus;
  }
}

/**
 * Start recurring background scheduler (1 hour interval).
 * Also runs immediately upon server start.
 */
function startAutoSyncScheduler() {
  const ONE_HOUR = 60 * 60 * 1000;
  console.log('[AutoSync] Initializing background hourly sync scheduler...');
  
  // Trigger initial sync 30s after server startup so DB connection is established
  setTimeout(() => {
    syncAllConnectedMembers().catch((err) =>
      console.error('[AutoSync] Initial background sync error:', err.message)
    );
  }, 30000);

  // Interval timer for every 1 hour
  setInterval(() => {
    syncAllConnectedMembers().catch((err) =>
      console.error('[AutoSync] Recurring background sync error:', err.message)
    );
  }, ONE_HOUR);
}

function getSyncStatus() {
  return syncStatus;
}

module.exports = {
  syncAllConnectedMembers,
  startAutoSyncScheduler,
  getSyncStatus,
  syncSingleMember,
};
