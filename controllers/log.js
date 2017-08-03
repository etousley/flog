const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const User = require('../models/User');

/**
 * GET /log
 * Render activity log
 */
exports.getLog = (req, res) => {
  res.render('log/index', {
    title: 'My Log'
  });
};

/**
 * Get user data (including log entries)
 */
exports.getUser = (req, res) => {
  const userEmail = req.query.email;
  const user = User.findOne( {email: userEmail });

  res.json(user);
}

/**
 * Return True if user's email address matches email address at end of URL
 * (E.g. Does this log belong to the current user?)
 */
exports.isLogOwner = (req) => {
  const ownerEmail = req.path.split('/').slice(-1)[0];
  if (req.isAuthenticated() && ownerEmail === req.user.email) {
      return true;
  } else {
    return false;
  }
};

/**
 * Create/update log entry for a single date
 */
exports.saveLogEntry = (entries) => {
  const user = request.user;
  const date = entry.date;

  if (user.log[date] === undefined) {
    user.log[date] = [];
  }
  user.log[date].push(entry)
}
