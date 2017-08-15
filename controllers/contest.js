const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const moment = require('moment');
const dateMask = 'YYYY-MM-DD';

/**
 * GET /team
 * Render team template
 */
exports.renderContest = (req, res) => {
  const today = moment().startOf('day').format(dateMask);
  const tomorrow = moment(today).add(1, 'days').format(dateMask);
  const entriesTodayQuery = {"date": { "$gte": today, "$lt": tomorrow } };

  console.log(entriesTodayQuery);

  LogEntry.count(entriesTodayQuery, function(err, result) {
    if (err) {
      res.status(500).send({"error": err})
    } else {
      console.log(result);
      res.render('contest/index', {
        title: 'Contests',
        user: req.user,
      });
    }
  });
};
