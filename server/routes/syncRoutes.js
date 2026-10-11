const express = require('express');
const router = express.Router();
const { syncAllConnectedMembers, getSyncStatus, retryFailedMembers } = require('../services/autoSyncService');

/**
 * Middleware to protect cron webhook endpoint.
 * Requires x-cron-secret header or Bearer token matching CRON_SECRET env variable.
 */
function verifyCronSecret(req, res, next) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret =
    req.headers['x-cron-secret'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!cronSecret) {
    return res.status(500).json({
      success: false,
      message: 'CRON_SECRET is not configured on the server. Please set CRON_SECRET in environment variables.',
    });
  }

  if (!providedSecret || providedSecret !== cronSecret) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or missing cron secret.',
    });
  }

  next();
}

/**
 * POST /api/sync/cron
 * Protected webhook endpoint for Render Cron Job, external uptime monitors, or GitHub Actions.
 * Triggers mandatory midnight full sync safely.
 */
router.post('/cron', verifyCronSecret, async (req, res) => {
  try {
    console.log('[SyncRoute] Authenticated cron webhook triggered.');
    const result = await syncAllConnectedMembers('CRON_MIDNIGHT');
    return res.status(200).json({
      success: true,
      message: 'Cron sync completed.',
      data: result,
    });
  } catch (err) {
    console.error('[SyncRoute] Error during cron sync execution:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Cron sync execution failed.',
      error: err.message,
    });
  }
});

module.exports = router;
