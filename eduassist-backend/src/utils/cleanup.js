'use strict';

const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const TEMP_DIR = path.join(__dirname, '..', '..', 'uploads', 'temp');
const PROCESSED_DIR = path.join(__dirname, '..', '..', 'uploads', 'processed');
const TTL_MS = (parseInt(process.env.TEMP_FILE_TTL_HOURS) || 24) * 60 * 60 * 1000;

function cleanDirectory(dir, ttlMs) {
  if (!fs.existsSync(dir)) return 0;
  const now = Date.now();
  let deleted = 0;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry === '.gitkeep') continue;
    try {
      const filePath = path.join(dir, entry);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > ttlMs) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    } catch (e) {
      logger.warn(`Cleanup: could not delete ${entry}: ${e.message}`);
    }
  }
  return deleted;
}

function runCleanup() {
  const tempDeleted = cleanDirectory(TEMP_DIR, TTL_MS);
  const processedDeleted = cleanDirectory(PROCESSED_DIR, TTL_MS * 2); // processed files live longer
  if (tempDeleted + processedDeleted > 0) {
    logger.info(`Cleanup: removed ${tempDeleted} temp, ${processedDeleted} processed files`);
  }
}

function startCleanupScheduler() {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    logger.info('Running scheduled file cleanup...');
    runCleanup();
  });

  // Also run once on startup
  runCleanup();
}

module.exports = { startCleanupScheduler, runCleanup };
