/**
 * Standalone CLI entrypoint for Render Cron Job or external scheduler.
 * Executes mandatory full sync of all connected members.
 * Timezone: Asia/Kolkata (Scheduled for 00:00 IST / 18:30 UTC).
 * Usage: node server/scripts/cronSync.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
require('dotenv').config(); // fallback to current dir

const { pool, testConnection } = require('../config/db');
const { syncAllConnectedMembers } = require('../services/autoSyncService');

async function runCronSync() {
  console.log('====================================================');
  console.log('[RenderCron] Starting Mandatory Full LeetCode Sync...');
  console.log(`[RenderCron] Timestamp: ${new Date().toISOString()} | IST: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`);
  console.log('====================================================');

  let dbOk = false;
  try {
    dbOk = await testConnection();
  } catch (err) {
    console.error('[RenderCron] Database initialization error:', err.message);
  }

  if (!dbOk) {
    console.error('[RenderCron] Database connection failed. Aborting with exit code 1.');
    try {
      await pool.end();
    } catch (_) {}
    process.exit(1);
  }

  let exitCode = 0;
  try {
    const result = await syncAllConnectedMembers('CRON_MIDNIGHT');

    if (result.skipped) {
      console.log('====================================================');
      console.log(`[RenderCron] Sync was skipped (${result.reason || 'another sync job in progress'}).`);
      console.log('====================================================');
    } else {
      console.log('====================================================');
      console.log('[RenderCron] Sync Run Completed Successfully:');
      console.log(`- Attempted: ${result.attempted}`);
      console.log(`- Succeeded: ${result.successful}`);
      console.log(`- Failed: ${result.failed}`);
      if (result.failedMembers && result.failedMembers.length > 0) {
        console.log('- Failed members summary:');
        result.failedMembers.forEach((m) => {
          console.log(`  * Member ${m.name} (@${m.leetcodeUsername}): ${m.error}`);
        });
      }
      console.log('====================================================');
    }
  } catch (err) {
    console.error('[RenderCron] Fatal error during sync job:', err.message);
    exitCode = 1;
  } finally {
    try {
      await pool.end();
      console.log('[RenderCron] Database pool closed cleanly.');
    } catch (closeErr) {
      console.error('[RenderCron] Error closing pool:', closeErr.message);
    }
    process.exit(exitCode);
  }
}

runCronSync();
