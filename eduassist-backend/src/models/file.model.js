'use strict';

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },         // bytes
  tool: {
    type: String,
    enum: ['img2pdf', 'merge', 'pdf2word', 'compress', 'ai-upload', 'cv'],
    required: true,
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'done', 'error'],
    default: 'uploading',
  },
  // Where the processed output lives (relative to uploads/processed/)
  outputPath: String,
  outputSize: Number,

  // Compression ratio etc.
  metadata: mongoose.Schema.Types.Mixed,

  // Auto-delete temp files after TTL
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    index: { expireAfterSeconds: 0 },
  },

  // Saved permanently by user
  saved: { type: Boolean, default: false },
  savedAt: Date,

  errorMessage: String,
}, { timestamps: true });

fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('File', fileSchema);
