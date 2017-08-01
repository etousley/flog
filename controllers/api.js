const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};
