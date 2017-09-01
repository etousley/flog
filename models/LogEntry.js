
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
  description: String,
  team: String,
  contest: String,
}, { timestamps: true });


// Virtual created timestamp generated from id
// Credit: https://stackoverflow.com/a/28458723
logEntrySchema.virtual('created').get( function () {
  if (this["_created"]) return this["_created"];
  return this["_created"] = this._id.getTimestamp();
});


// Model is named 'LogEntry', but collection name is 'logEntries'
const LogEntry = mongoose.model('LogEntry', logEntrySchema, 'logEntries');

module.exports = LogEntry;
