const mongoose = require('mongoose');
const logEntry = require('../controllers/logEntry');

// Embedded child object of logEntrySchema
const logEntryDurationSchema = new mongoose.Schema({
  unit: { type: String, required: true },  // e.g. "minutes"
  value: { type: Number, required: true }  // e.g. 20
})

const logEntrySchema = new mongoose.Schema({
  user: { type: String, required: true },  // User's email address
  date: { type: Date, required: true },
  activity: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: logEntryDurationSchema, required: true },
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

const LogEntry = mongoose.model('LogEntry', logEntrySchema);

module.exports = LogEntry;
