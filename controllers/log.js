const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });

/**
 * GET /api
 * List of API examples.
 */
exports.getLog = (req, res) => {
  res.render('log/index', {
    title: 'My Log'
  });
};
