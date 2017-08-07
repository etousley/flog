const mongoose = require('mongoose');
const logEntry = require('../controllers/logEntry');


const logEntrySchema = new mongoose.Schema({
  user: { type: String, required: true },  // User's email address
  date: { type: Date, required: true },
  activity: { type: String, required: true },
  category: { type: String, required: true },
  durationUnit: { type: String, required: true },
  durationValue: { type: Number, required: true },
  points: Number,

  title: String,
  description: String,
  updated: { type: Date, default: Date.now }

}, { timestamps: true });

/*
 * Pre-save method of logEntrySchema
 * Automatically calculate activity points based on activity type and duration
 */
logEntrySchema.pre('save', function(next) {
  this.points = logEntry.calculateActivityPoints(this);
})

/*
 * Pre-update method of logEntrySchema
 * Automatically calculate activity points based on activity type and duration
 */
logEntrySchema.pre('update', function(next) {
  this.points = logEntry.calculateActivityPoints(this);
})

// Model is named 'LogEntry', but collection name is 'logEntries'
const LogEntry = mongoose.model('LogEntry', logEntrySchema, 'logEntries');

module.exports = LogEntry;
