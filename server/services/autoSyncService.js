const { pool } = require('../config/db');
const leetcodeService = require('./leetcodeService');
const { reconcileUserStats, reconcileAllUsersStats } = require('./statsReconciliationService');

// In-memory status for monitoring & admin dashboard
let syncStatus = {
  status: 'Active',
  isSyncing: false,
  currentMember: null,
  lastRun: null,
  lastRunStarted: null,
  lastRunFinished: null,
  triggerType: 'NONE',
  attempted: 0,
  successful: 0,
  failed: 0,
  failedMembers: [],
  connectedMembers: 0,
  nextScheduledMidnight: null,
  nextScheduledMidnightIso: null,
};

let midnightTimeoutId = null;
let changeDetectionIntervalId = null;

/**
 * Calculates milliseconds until 12:00:00 AM in Asia/Kolkata timezone.
 */
function getNextMidnightKolkata() {
  const now = new Date();
  const kolkataStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kolkataNow = new Date(kolkataStr);
  const nextMidnight = new Date(kolkataNow);
  nextMidnight.setHours(24, 0, 0, 0); // 12:00:00 AM next day
  const msRemaining = Math.max(nextMidnight.getTime() - kolkataNow.getTime(), 1000);
  const nextMidnightUtc = new Date(now.getTime() + msRemaining);
  return {
    msRemaining,
    nextDate: nextMidnightUtc,
    nextKolkataStr: nextMidnightUtc.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' (Asia/Kolkata)',
  };
}

/**
 * Helper to execute an async function with bounded exponential backoff for transient errors.
 * Never retries 400 or 404 permanent errors.
 */
async function fetchWithRetry(fn, maxRetries = 2, delayMs = 1000) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      // Never retry non-existent users (404) or invalid usernames (400)
      if (err.statusCode === 404 || err.statusCode === 400 || err.isNotFound || attempt > maxRetries) {
        throw err;
      }
      const backoff = delayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

/**
 * Records a stats history snapshot ONLY if stats have changed.
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
 * Isolates errors, tracks attempted sync, records safe errors, and updates stats.
 */
async function syncSingleMember(user) {
  const userId = user.id;
  const rawUsername = user.leetcode_username || '';
  const username = rawUsername.trim().replace(/^@+/, '');

  if (!username) return { success: false, reason: 'Empty username' };

  const attemptTime = new Date();
  // Record attempted sync timestamp immediately
  try {
    await pool.query(
      `UPDATE users SET leetcode_last_attempted_sync = ? WHERE id = ?`,
      [attemptTime, userId]
    );
  } catch (dbErr) {
    console.error(`[AutoSync] Could not update leetcode_last_attempted_sync for user ${userId}:`, dbErr.message);
  }

  // 1. Fetch current LeetCode stats with bounded retry
  let stats;
  try {
    stats = await fetchWithRetry(() => leetcodeService.getLeetCodeStats(username), 2, 1000);
  } catch (err) {
    const safeError =
      err.statusCode === 404 || err.isNotFound
        ? 'LeetCode user not found (404)'
        : err.statusCode === 400
        ? 'Invalid LeetCode username (400)'
        : err.statusCode === 429
        ? 'LeetCode rate limit reached (429)'
        : (err.message || 'Failed to fetch LeetCode statistics').slice(0, 255);

    try {
      await pool.query(
        `UPDATE users SET leetcode_last_attempted_sync = ?, leetcode_sync_error = ? WHERE id = ?`,
        [attemptTime, safeError, userId]
      );
    } catch (saveErr) {
      // ignore secondary DB error
    }

    console.error(`[AutoSync] Sync failed for member ID ${userId} (@${username}): ${safeError}`);
    throw new Error(safeError);
  }

  const syncTime = new Date();

  // 2. Fetch recent activity to update leetcode_last_activity
  let lastActivityDate = null;
  try {
    const recentSubmissions = await fetchWithRetry(
      () => leetcodeService.getRecentLeetCodeActivity(username),
      1,
      1000
    );
    if (recentSubmissions && recentSubmissions.length > 0 && recentSubmissions[0].timestamp) {
      lastActivityDate = new Date(recentSubmissions[0].timestamp);
    }
  } catch (actErr) {
    // Non-fatal activity fetch error
  }

  // 3. Update user statistics, sync timestamp, and clear any prior sync error
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
           leetcode_last_attempted_sync = ?,
           leetcode_sync_error = NULL,
           leetcode_last_activity = ?
       WHERE id = ?`,
      [
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        syncTime,
        syncTime,
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
           leetcode_last_synced = ?,
           leetcode_last_attempted_sync = ?,
           leetcode_sync_error = NULL
       WHERE id = ?`,
      [
        stats.totalSolved,
        stats.easySolved,
        stats.mediumSolved,
        stats.hardSolved,
        stats.totalQuestions,
        stats.ranking,
        syncTime,
        syncTime,
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
  let newSubmissionsCount = 0;
  try {
    const historySubmissions = await fetchWithRetry(
      () => leetcodeService.getAcceptedSubmissionHistory(username),
      1,
      1000
    );
    for (const sub of historySubmissions) {
      const [insertRes] = await pool.query(
        `INSERT INTO leetcode_submissions 
         (user_id, problem_title, problem_slug, difficulty, language, solved_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           difficulty = COALESCE(VALUES(difficulty), difficulty),
           language = COALESCE(VALUES(language), language),
           problem_title = COALESCE(VALUES(problem_title), problem_title)`,
        [userId, sub.problemTitle, sub.problemSlug, sub.difficulty, sub.language, sub.solvedAt]
      );
      if (insertRes.affectedRows === 1) {
        newSubmissionsCount++;
      }
    }
  } catch (subErr) {
    console.error(`[AutoSync] Non-fatal submission sync error for user ID ${userId}:`, subErr.message);
  }

  // 6. Reconcile user statistics with unique solved problems count
  try {
    await reconcileUserStats(userId);
  } catch (recErr) {
    console.error(`[AutoSync] Non-fatal reconciliation error for user ID ${userId}:`, recErr.message);
  }

  return { success: true, newSubmissionsCount };
}

/**
 * Main batch sync function: processes connected MEMBER users.
 * Supports triggerType and optional filter (e.g. onlyFailed: true).
 * Protected by both in-process flag AND MySQL advisory lock for cross-process mutual exclusion.
 */
async function syncAllConnectedMembers(triggerType = 'SCHEDULED_HOURLY', options = {}) {
  // 1. In-process overlap protection
  if (syncStatus.isSyncing) {
    console.log(`[AutoSync] Sync already in progress (${syncStatus.triggerType}), skipping concurrent request.`);
    return { ...syncStatus, skipped: true, reason: 'In-process sync already running' };
  }

  // 2. Cross-process overlap protection via MySQL advisory lock
  let lockConn = null;
  let lockAcquired = false;
  try {
    lockConn = await pool.getConnection();
    const [lockRows] = await lockConn.query("SELECT GET_LOCK('leetcode_sync_job_lock', 0) as acquired");
    lockAcquired = lockRows[0]?.acquired === 1;

    if (!lockAcquired) {
      console.log(`[AutoSync] Cross-process lock held for leetcode_sync_job_lock. Skipping ${triggerType}.`);
      lockConn.release();
      return { ...syncStatus, skipped: true, reason: 'Cross-process MySQL lock held by another process' };
    }
  } catch (lockErr) {
    console.error('[AutoSync] Error acquiring cross-process lock:', lockErr.message);
    if (lockConn) lockConn.release();
    return { ...syncStatus, skipped: true, reason: 'Lock acquisition failure' };
  }

  syncStatus.isSyncing = true;
  syncStatus.triggerType = triggerType;
  const startTime = new Date();
  syncStatus.lastRunStarted = startTime.toISOString();

  console.log(`[AutoSync] Starting synchronization batch (Trigger: ${triggerType})...`);

  let runId = null;
  try {
    const [runInsert] = await pool.query(
      `INSERT INTO sync_job_runs (trigger_type, status, started_at) VALUES (?, 'RUNNING', ?)`,
      [triggerType, startTime]
    );
    runId = runInsert.insertId;
  } catch (runErr) {
    console.error('[AutoSync] Could not record sync_job_runs start:', runErr.message);
  }

  try {
    // Select connected members
    let query = `
      SELECT id, name, leetcode_username, leetcode_last_synced, leetcode_sync_error
      FROM users 
      WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL AND TRIM(leetcode_username) != ''
    `;
    const params = [];

    // For retry, only retry transient errors (skip permanent 404 User Not Found or 400 Invalid)
    if (options.onlyFailed) {
      query += ` AND leetcode_sync_error IS NOT NULL 
                 AND leetcode_sync_error NOT LIKE '%404%' 
                 AND leetcode_sync_error NOT LIKE '%400%'`;
    }

    const [members] = await pool.query(query, params);

    // Get total count of all connected members for reporting
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM users WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL AND TRIM(leetcode_username) != ''`
    );
    const totalConnected = countRows[0]?.total || members.length;

    let successCount = 0;
    let failCount = 0;
    const failedMembers = [];

    for (const member of members) {
      syncStatus.currentMember = `@${member.leetcode_username}`;
      try {
        console.log(`[AutoSync] Syncing member ${member.name} (@${member.leetcode_username})...`);
        await syncSingleMember(member);
        successCount++;
      } catch (err) {
        failCount++;
        failedMembers.push({
          id: member.id,
          name: member.name,
          leetcodeUsername: member.leetcode_username,
          error: err.message,
        });
      }

      // 600ms delay between members to respect LeetCode rate limits
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    const finishTime = new Date();
    const nextMidnight = getNextMidnightKolkata();

    syncStatus = {
      status: 'Active',
      isSyncing: false,
      currentMember: null,
      lastRun: finishTime.toISOString(),
      lastRunStarted: startTime.toISOString(),
      lastRunFinished: finishTime.toISOString(),
      triggerType,
      attempted: members.length,
      successful: successCount,
      failed: failCount,
      failedMembers,
      connectedMembers: totalConnected,
      nextScheduledMidnight: nextMidnight.nextKolkataStr,
      nextScheduledMidnightIso: nextMidnight.nextDate.toISOString(),
    };

    if (runId) {
      const errorSummary = failedMembers.length > 0 ? JSON.stringify(failedMembers) : null;
      await pool.query(
        `UPDATE sync_job_runs 
         SET status = 'COMPLETED', finished_at = ?, members_attempted = ?, members_succeeded = ?, members_failed = ?, error_summary = ?
         WHERE id = ?`,
        [finishTime, members.length, successCount, failCount, errorSummary, runId]
      );
    }

    console.log(`[AutoSync] Batch complete (Trigger: ${triggerType}). Attempted: ${members.length}, Succeeded: ${successCount}, Failed: ${failCount}`);
    return syncStatus;
  } catch (error) {
    console.error('[AutoSync] Batch execution fatal error:', error.message);
    const finishTime = new Date();
    syncStatus.isSyncing = false;
    syncStatus.status = 'Error';
    syncStatus.currentMember = null;
    syncStatus.lastRunFinished = finishTime.toISOString();

    if (runId) {
      await pool.query(
        `UPDATE sync_job_runs SET status = 'FAILED', finished_at = ?, error_summary = ? WHERE id = ?`,
        [finishTime, error.message, runId]
      );
    }

    return syncStatus;
  } finally {
    if (lockAcquired && lockConn) {
      try {
        await lockConn.query("SELECT RELEASE_LOCK('leetcode_sync_job_lock')");
      } catch (_) {}
    }
    if (lockConn) {
      lockConn.release();
    }
    syncStatus.isSyncing = false;
  }
}

/**
 * Retry only members whose previous sync attempt resulted in an error.
 */
async function retryFailedMembers() {
  return await syncAllConnectedMembers('RETRY_FAILED', { onlyFailed: true });
}

/**
 * Lightweight change detection for active members.
 * Checks if members have newly accepted problems since last sync and triggers targeted sync.
 */
async function checkForMemberSubmissionChanges() {
  if (syncStatus.isSyncing) return;

  try {
    const [members] = await pool.query(
      `SELECT id, name, leetcode_username, leetcode_total_solved, leetcode_last_activity 
       FROM users 
       WHERE role = 'MEMBER' AND leetcode_username IS NOT NULL AND TRIM(leetcode_username) != ''`
    );

    for (const member of members) {
      const cleanUsername = (member.leetcode_username || '').trim().replace(/^@+/, '');
      if (!cleanUsername) continue;

      try {
        const stats = await leetcodeService.getLeetCodeStats(cleanUsername);
        // If official total solved count has increased, trigger immediate targeted sync for this member
        if (stats.totalSolved > (member.leetcode_total_solved || 0)) {
          console.log(`[ChangeDetection] Detected new solve for ${member.name} (@${cleanUsername}): ${stats.totalSolved} > ${member.leetcode_total_solved}. Syncing member...`);
          await syncSingleMember(member);
        }
      } catch (err) {
        // Quietly skip for change detection check
      }

      // Small delay between checks
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  } catch (err) {
    console.error('[ChangeDetection] Error checking for submission changes:', err.message);
  }
}

/**
 * Schedules mandatory daily sync at 12:00:00 AM Asia/Kolkata timezone.
 */
function scheduleMidnightSync() {
  if (midnightTimeoutId) {
    clearTimeout(midnightTimeoutId);
  }

  const { msRemaining, nextDate, nextKolkataStr } = getNextMidnightKolkata();
  syncStatus.nextScheduledMidnight = nextKolkataStr;
  syncStatus.nextScheduledMidnightIso = nextDate.toISOString();

  console.log(`[AutoSync] Next mandatory midnight sync scheduled for: ${nextKolkataStr} (in ${Math.round(msRemaining / 60000)} minutes)`);

  midnightTimeoutId = setTimeout(async () => {
    console.log('[AutoSync] Executing mandatory midnight sync (Asia/Kolkata)...');
    try {
      await syncAllConnectedMembers('CRON_MIDNIGHT');
    } catch (err) {
      console.error('[AutoSync] Midnight sync execution error:', err.message);
    } finally {
      // Reschedule for the next midnight
      scheduleMidnightSync();
    }
  }, msRemaining);
}

/**
 * Starts all background scheduler loops:
 * 1. Startup reconciliation & initial member sync (after 30s)
 * 2. Hourly background sync
 * 3. Mandatory midnight sync at 12:00 AM Asia/Kolkata
 * 4. Lightweight submission-change polling every 10 minutes
 */
function startAutoSyncScheduler() {
  const ONE_HOUR = 60 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;

  console.log('[AutoSync] Initializing background sync scheduler & midnight cron...');

  // 1. Initial startup reconciliation
  reconcileAllUsersStats().catch((err) =>
    console.error('[AutoSync] Startup reconciliation error:', err.message)
  );

  // 2. Schedule mandatory midnight sync (Asia/Kolkata)
  scheduleMidnightSync();

  // 3. Initial sync 30s after server boot
  setTimeout(() => {
    syncAllConnectedMembers('SCHEDULED_HOURLY').catch((err) =>
      console.error('[AutoSync] Initial background sync error:', err.message)
    );
  }, 30000);

  // 4. Regular hourly background sync
  setInterval(() => {
    syncAllConnectedMembers('SCHEDULED_HOURLY').catch((err) =>
      console.error('[AutoSync] Recurring hourly sync error:', err.message)
    );
  }, ONE_HOUR);

  // 5. Lightweight submission-change detection every 10 minutes
  changeDetectionIntervalId = setInterval(() => {
    checkForMemberSubmissionChanges().catch((err) =>
      console.error('[AutoSync] Change detection loop error:', err.message)
    );
  }, TEN_MINUTES);
}

function getSyncStatus() {
  const next = getNextMidnightKolkata();
  syncStatus.nextScheduledMidnight = next.nextKolkataStr;
  syncStatus.nextScheduledMidnightIso = next.nextDate.toISOString();
  return syncStatus;
}

module.exports = {
  syncAllConnectedMembers,
  startAutoSyncScheduler,
  getSyncStatus,
  syncSingleMember,
  retryFailedMembers,
  getNextMidnightKolkata,
};
