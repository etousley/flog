
const mongoose = require('mongoose');
const lookups = require('../public/js/lookups');
const activityNames = Object.keys(lookups.activityDefinitions);


const logEntrySchema = new mongoose.Schema({
  user: { type: String, required: true },  // User's email address
  date: { type: Date, required: true },
  activity: { type: String, required: true },
  // category: { type: String, required: true },
  durationUnit: { type: String, required: true, enum: activityNames },
  durationValue: { type: Number, required: true },
  points: Number,
  title: String,
  description: String
}, { timestamps: true });


// Model is named 'LogEntry', but collection name is 'logEntries'
const LogEntry = mongoose.model('LogEntry', logEntrySchema, 'logEntries');

module.exports = LogEntry;
