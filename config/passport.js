const passport = require('passport');
const request = require('request');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/User');
const userTeams = require('../controllers/user').userTeams;


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },
  (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      // User has already logged in (user info is in request)
      User.findOne({ google: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
          done(err);
        } else {
          User.findById(req.user.id, (err, user) => {
            if (err) { return done(err); }
            user.google = profile.id;
            user.tokens.push({ kind: 'google', accessToken });
            user.profile.name = user.profile.name || profile.displayName;
            user.profile.gender = user.profile.gender || profile._json.gender;
            user.profile.picture = user.profile.picture || profile._json.image.url;
            user.save((err) => {
              req.flash('info', { msg: 'Google account has been linked.' });
              done(err, user);
            });
          });
        }
      });
    } else {
      // User wasn't already logged in
      if ( profile.emails[0].value.endsWith('readingplus.com') ) {
        User.findOne({ google: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            const teamInfo = userTeams[existingUser.email] || {};
            Object.assign(existingUser, teamInfo);
            existingUser.save((err) => {
              return done(err, existingUser);
            });
            // return done(null, existingUser);
          }
          User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
            if (err) { return done(err); }
            if (existingEmailUser) {
              req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
              done(err, existingEmailUser);
            } else {
              const user = new User();
              user.email = profile.emails[0].value;
              user.google = profile.id;
              user.tokens.push({ kind: 'google', accessToken });
              user.profile.name = profile.displayName;
              user.profile.gender = profile._json.gender;
              user.profile.picture = profile._json.image.url;
              const teamInfo = userTeams[user.email] || {};
              Object.assign(user, teamInfo);
              user.save((err) => {
                done(err, user);
              });
            }
          });
        });
      } else {
        const msg = 'Access Denied. Please log in using a readingplus.com email address.';
        req.flash('errors', { msg: msg });
        done(new Error(msg));
      }
    }
  }
));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  console.log('provider ' + provider);
  const token = req.user.tokens.find(token => token.kind === provider);
  if (token) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
