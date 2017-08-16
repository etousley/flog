const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const LogEntry = require('../models/LogEntry');


/**
 * GET /contest
 * Render contest template
 */
exports.renderContest = (req, res) => {
  const contestUserQuery = {
    _id: { team: "$team", user: "$user", contest: "$contest" },
    userPoints: { $sum: "$points" }
  };

  res.render('contest/index', {
    title: 'Contests',
    user: req.user,
  });
};


/**
 * Get user point totals, grouped by contest. Include team data for later
 */
getContestUserPoints = () => {
  const contestUserQuery = {
    _id: { team: "$team", user: "$user", contest: "$contest" },
    userPoints: { $sum: "$points" }
  };
  LogEntry.aggregate(contestUserQuery, function(err, result) {
    if (err) {
      res.status(500).send({"error": err})
    } else {
      console.log(result);
      return result;
    }
  });
};
