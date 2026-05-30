'use strict';

const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // What the user submitted
  inputType: {
    type: String,
    enum: ['text', 'pdf', 'image'],
    required: true,
  },
  inputText: String,                  // raw pasted text or extracted text
  inputFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },

  // What was requested
  requestedTypes: [{
    type: String,
    enum: ['summary', 'mcq', 'shortq', 'broadq', 'viva', 'topics', 'explain'],
  }],

  // Generated results — keyed by type
  results: {
    summary: String,
    mcq: [{ question: String, options: [String], correctIndex: Number, explanation: String }],
    shortq: [{ question: String, answer: String }],
    broadq: [String],
    viva: [{ question: String, hint: String }],
    topics: [String],
    explain: String,
  },

  // AI provider & model used
  provider: { type: String, enum: ['anthropic', 'openai'], default: 'anthropic' },
  model: String,

  // Token usage
  tokensUsed: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['processing', 'done', 'error'],
    default: 'processing',
  },
  errorMessage: String,
  processingTimeMs: Number,

  // User can title/save a session
  title: String,
  saved: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

aiHistorySchema.index({ userId: 1, createdAt: -1 });
aiHistorySchema.index({ userId: 1, saved: 1 });

module.exports = mongoose.model('AiHistory', aiHistorySchema);
