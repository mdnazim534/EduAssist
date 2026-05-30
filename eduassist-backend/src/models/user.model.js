'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Firebase UID (primary auth source)
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  avatar: String,
  plan: {
    type: String,
    enum: ['free', 'pro', 'team'],
    default: 'free',
  },
  // Storage quota in bytes
  storageUsed: { type: Number, default: 0 },
  storageLimit: { type: Number, default: 2 * 1024 * 1024 * 1024 }, // 2GB

  // Preferences
  preferences: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    emailNotifications: { type: Boolean, default: true },
    processingAlerts: { type: Boolean, default: true },
    defaultAiProvider: { type: String, enum: ['anthropic', 'openai'], default: 'anthropic' },
  },

  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } },
});

userSchema.virtual('storageUsedMB').get(function () {
  return (this.storageUsed / (1024 * 1024)).toFixed(2);
});

userSchema.virtual('storageLimitMB').get(function () {
  return (this.storageLimit / (1024 * 1024)).toFixed(0);
});

userSchema.methods.hasStorageSpace = function (bytes) {
  return (this.storageUsed + bytes) <= this.storageLimit;
};

module.exports = mongoose.model('User', userSchema);
