'use strict';

const admin = require('firebase-admin');
const logger = require('../utils/logger');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    logger.warn('Firebase credentials not fully set — auth will be degraded');
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: FIREBASE_CLIENT_EMAIL,
    }),
  });

  initialized = true;
}

function getAuth() {
  if (!initialized) throw new Error('Firebase not initialized');
  return admin.auth();
}

module.exports = { initFirebase, getAuth, admin };
