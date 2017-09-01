const moment = require('moment');
const LogEntry = require('../models/LogEntry');
const dateMask = "YYYY-MM-DD";

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
 const today = moment().startOf('day').format(dateMask);
 const tomorrow = moment(today).add(1, 'days').format(dateMask);
 const entriesTodayQuery = {"date": { "$gte": today, "$lt": tomorrow } };

 LogEntry.find(entriesTodayQuery, function(err, result) {
   if (err) {
     res.status(500).send({"error": err})
   } else {
     res.render('home', {
       title: 'Home',
       user: req.user,
       entriesToday: result,
       moment: moment  // Formatting timestamps in template
     });
   }
 });
};
// exports.index = (req, res) => {
//   res.render('home', {
//     title: 'Home',
//     user: req.user,
//   });
// };
