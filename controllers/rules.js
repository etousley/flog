
/**
 * GET /
 * Rules page.
 */
exports.index = (req, res) => {
 res.render('rules', {
   title: 'Rules',
   user: req.user 
 });
};
