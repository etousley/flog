const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const moment = require('moment');
const LogEntry = require('../models/LogEntry');
const lookups = require('../public/js/lookups.js');


/**
 * Return activityDefinitions object
 */
exports.getActivityDefinitions = (req, res) => {
  res.send(lookups.activityDefinitions);
};


/**
 * GET /log
 * Render logEntry log template
 */
exports.getLog = (req, res) => {
  res.render('log/index', {
    title: 'My Log',
    user: req.user,
    logOwner: {email: req.url.split("/").slice(-1)[0]},
    activities: lookups.activityDefinitions
  });
};


/**
 * REST API endpoint
 * GET all log entries. Can filter with query string, e.g.:
 *  /api/log?user=user@domain.com&from=2017-05-01&to=2017-06-01
 */
exports.getLogEntries = (req, res) => {
  let user = req.query.user;  // user's email address
  let from = req.query.from;
  let to = req.query.to;
  let filter = {};

  if (user !== undefined) {
    user = user.replace('%40', '@');  // '@' symbol gets escaped sometimes
    filter["user"] = user;
  }

  if (from !== undefined || to !== undefined) {
    filter["date"] = {};
    if (from !== undefined) {
      filter["date"]["$gte"] = from;
    }
    if (to !== undefined) {
      filter["date"]["$lte"] = to;
    }
  }

  // console.log('filter: ' + JSON.stringify(filter));

  LogEntry.find(filter, function(err, logEntries) {
    if (err) {
      res.status(500).send({"error": err})
    } else {
      res.send({ "data": logEntries });
    }
  });
};


/**
 * REST API endpoint
 * GET one log entry by ID
 */
exports.getLogEntry = (req, res) => {
  const id = req.params.id;

  LogEntry.findById(id, function(err, logEntry) {
    if (err) {
      console.log(err);
      res.statusMessage = err.toString();
      res.status(500).end();
    } else {
      console.log(logEntry);
      res.send({ "data": logEntry });
    }
  });
};


/**
 * REST API endpoint
 * Create new log entry
 * Should be behind isAuthenticatedOwner middleware
 */
exports.createLogEntry = (req, res) => {
  const entry = new LogEntry(req.body.data);
  const requesterEmail = req.user.email;
  const ownerEmail = entry.user;

  if (requesterEmail === ownerEmail) {
    console.log('about to call LogEntry.create()...');
    // Note: Mongoose bug: Model.create() and instance.save() never execute callback
    // Workaround: Use $__save()
    // https://github.com/Automattic/mongoose/issues/4064
    entry.$__save({}, function(err, createdEntry) {
      console.log('in create callback');
      if (err) {
        console.log(err);
        res.statusMessage = err.toString();
        res.status(500).end();
      } else {
        console.log('created:' + JSON.stringify(createdEntry));
        res.send({ "data": createdEntry });
      }
    });
  } else {
    res.status(403).send("403 Forbidden: You aren't the owner of this log entry");
  }
};


/**
 * REST API endpoint
 * Update log entry by ID
 * Should be behind isAuthenticatedOwner middleware
 */
exports.updateLogEntry = (req, res) => {
  const id = req.params.id;
  const entryData = req.body.data;
  const requesterEmail = req.user.email;
  const ownerEmail = entryData.user;

  if (requesterEmail === ownerEmail) {
    // Mongoose returns original object instead of updated object by default (?????)
    LogEntry.findByIdAndUpdate(id, entryData, {new: true}, function(err, updatedEntry) {
      if (err) {
        console.log(err);
        res.statusMessage = err.toString();
        res.status(500).end();
      } else {
        res.send({ "data": updatedEntry });
        console.log('updated:' + JSON.stringify(updatedEntry));
      }
    });
  } else {
    res.status(403).send("403 Forbidden: You aren't the owner of this log entry");
  }
};



/**
 * REST API endpoint
 * Delete log entry by id
 * Should be behind isAuthenticatedOwner middleware
 */
exports.deleteLogEntry = (req, res) => {
  const id = req.params.id;
  const requesterEmail = req.user.email;

  LogEntry.findById(id, function(err, logEntry) {
    if (logEntry && logEntry.user === requesterEmail) {
      logEntry.remove(function(err) {
        if (err) {
          console.log(err);
          res.statusMessage = err.toString();
          res.status(500).end();
        } else {
          res.send( { "data": { "deleted": {"_id": id} } } );
          console.log('deleted:' + JSON.stringify({"_id": id}));
        }
      });
    } else {
      res.status(403).send("403 Forbidden: You aren't the owner of this log entry");
    }
  });
};


/**
 * Calculate points based on activity and duration
 */
exports.calculateActivityPoints = (logEntry) => {
  const activityDefinition = lookups.activityDefinitions[logEntry.activity];

  // Is it the right time unit?
  if (logEntry.durationUnit !== activityDefinition.durationUnit) {
    throw Error('500 error: Invalid activity.durationUnit: ' + logEntry.durationUnit + '. Expected: ' + activityDefinition.durationUnit);
  }

  const completedTimeChunks = Math.floor(logEntry.durationValue / activityDefinition.durationValue);
  const points = completedTimeChunks * activityDefinition.points;
  console.log("calculated points: " + points);

  return points;
};
