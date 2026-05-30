'use strict';

const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  title: { type: String, default: 'My CV', maxlength: 100 },
  template: { type: String, enum: ['t1', 't2', 't3'], default: 't1' },
  isPublic: { type: Boolean, default: false },
  slug: String,

  personal: {
    name: { type: String, required: true, maxlength: 100 },
    role: String,
    email: String,
    phone: String,
    location: String,
    website: String,
    linkedin: String,
    github: String,
    twitter: String,
    summary: { type: String, maxlength: 1000 },
    avatar: String,
  },

  education: [{
    degree: String,
    institution: String,
    startYear: String,
    endYear: String,
    gpa: String,
    description: String,
    _id: false,
  }],

  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false },
    description: String,
    achievements: [String],
    _id: false,
  }],

  skills: {
    technical: [String],
    soft: [String],
    languages: [String],
    tools: [String],
  },

  projects: [{
    name: String,
    description: String,
    url: String,
    github: String,
    tech: [String],
    _id: false,
  }],

  certifications: [{
    name: String,
    issuer: String,
    date: String,
    url: String,
    _id: false,
  }],

  // Path to generated PDF
  pdfPath: String,
  pdfGeneratedAt: Date,

}, { timestamps: true });

cvSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('CV', cvSchema);
