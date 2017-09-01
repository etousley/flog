const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const moment = require('moment');
const LogEntry = require('../models/LogEntry');
const contestDefinitions = require('../public/js/lookups').contests;
const userTeams = require('../controllers/user').userTeams;
const dateMask = "MM/DD/YYYY";


/**
 * GET /contest
 * Render contest template
 */
exports.renderContest = (req, res) => {
  getContestResults( (contests) => {
    res.render('contest/index', {
      title: 'Contests',
      user: req.user,
      contests: contests
    });
  });
};


/**
 * Get first contest whose start/end dates bound today's date
 */
getActiveContestName = (logEntry) => {
  const logEntryDate = moment(logEntry.date);
  let contestName = '';
  let contestInfo;
  let contestStartDate;
  let contestEndDate;
  let userTeamInfo = userTeams[logEntry.user];

  // Only assign to contest if user is a competitor
  if ( !(userTeamInfo && userTeamInfo.isCompetitor) ) {
    return '';
  }

  for ( contestName of Object.keys(contestDefinitions) ) {
    contestInfo = contestDefinitions[contestName];
    contestStartDate = moment(contestInfo.startDate);
    contestEndDate = moment(contestInfo.endDate);
    // console.log(logEntryDate, contestStartDate, contestEndDate);

    // Return contest if date is between startDate (inclusive) and endDate (NOT inclusive)
    // Credit: https://stackoverflow.com/a/29495647
    if ( logEntryDate.isBetween(contestStartDate, contestEndDate, 'days', '[)') ) {
      // console.log(logEntryDate, contestName)
      return contestName;
    }
  }
}


/**
 * Get teams object
 */
getTeams = () => {
  let teams = {};
  for (let user of Object.keys(userTeams)) {
    let teamInfo = userTeams[user];
    let teamName = teamInfo.team;
    if ( !(teamName in teams) ) {
      teams[teamName] = {'points': 0, 'captain': undefined};
    }
    if (teamInfo.isCaptain && true) {
      teams[teamName] ["captain"] = user;
    }
  }
  return teams;
}


objToList = (obj, keyName = "key") => {
  let list = [];
  for (let key of Object.keys(obj)) {
    let val = obj[key];
    val[keyName] = key;
    list.push(val);
  }
  return list;
}

/**
 * Aggregate user-level point totals to team-level point totals
 * Note: Want to show points = 0 rather than omitting team entirely
 * Note: Would have been a lot easier with a relational DB
 * Todo: Add points to userTeams, convert to sorted list of users at the end
 */
getContestResults = (callback) => {
  const contestUserQuery = [
    { $group: {
        _id: { team: "$team", user: "$user", contest: "$contest" },
        points: { $sum: "$points" }
    } }
  ];
  let contests = [];
  let teams = getTeams();

  LogEntry.aggregate(contestUserQuery, function(err, contestUserResults) {
    if (err) {
      res.status(500).send({"error": err})
    } else {
      // Loop through complete contest list
      for ( let contestName of Object.keys(contestDefinitions) ) {
        let contestInfo = contestDefinitions[contestName];
        let contest = {
          'name': contestName,
          'startDate': contestInfo.startDate.format(dateMask),
          'endDate': contestInfo.endDate.format(dateMask),
          'teams': teams,
          'users': userTeams
        };

        // Ignore contests that haven't started yet
        if ( contestInfo.startDate > moment() ) {
          continue;
        }

        // Loop through complete user (userTeam) dictionary
        for ( let userEmail of Object.keys(userTeams) ) {
          let userTeamInfo = userTeams[userEmail];
          Object.assign(contest.users[userEmail], {"points": 0});

          // Get user points for this contest; update user + team contest results
          for (let userResult of contestUserResults) {
            if (userResult._id.contest === contestName && userResult._id.user === userEmail) {
              contest.users[userEmail].points += userResult.points;
              contest.teams[userTeamInfo.team].points += userResult.points;
            }
          }
        }

        // Convert contest user/team objects to sortable lists
        contest.users = objToList(contest.users, "name")
        contest.teams = objToList(contest.teams, "name")

        // Sort contest results by points (descending)
        contest.users.sort( (a, b) => {
          return b.points - a.points;
        });
        contest.teams.sort( (a, b) => {
          return b.points - a.points;
        });

        contests.push(contest);
      }

      // Sort contests by date, descending
      contests.sort( (a, b) => {
        return b.startDate - a.startDate;
      });

      if (callback) {
        return callback(contests);
      } else {
        return contests;
      }
    }
  });
};
