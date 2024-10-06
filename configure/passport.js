const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcryptjs');
var http = require('https');
var fs = require('fs');
const path = require('path');

// Load User model
const User = require('../models/User');

const download = (url, dest, cb) => {
  const file = fs.createWriteStream(dest);

  const request = http.get(url, (response) => {
      // check if response is success
      if (response.statusCode !== 200) {
          return cb('Response status was ' + response.statusCode);
      }
      response.pipe(file);
  });

  // close() is async, call cb after close completes
  file.on('finish', () => file.close(cb));

  // check for request error too
  request.on('error', (err) => {
      fs.unlinkSync(dest);
      return cb(err.message);
  });

  file.on('error', (err) => { // Handle errors
      fs.unlinkSync(dest); // Delete the file async. (But we don't check the result) 
      return cb(err.message);
  });
};

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        authWith: 'local',
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );
  

  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BASE_URL + '/users/auth/google/callback'
    },
    ( accessToken, refreshToken, profile, done ) => {

      User.findOne({ authWith:'google', googleId : profile.id}).then( user => {
        if(!user)
        {
          newUser = new User();

          newUser.googleId = profile.id;
          newUser.email = profile.emails[0].value;
          newUser.name = profile.displayName;
          newUser.authWith = 'google';
          newUser.profilePicURL = '/profilePics/'+ newUser.id + '.png';

          download(profile.photos[0].value, path.join(__dirname,'..','profilePics',newUser.id+'.png'), (err) => {if (err) {console.error('Download failed:', err);} else {console.log('Download succeeded');}});

          newUser.save();

          return done(null,newUser);
        }
        else
        {
          return done(null,user);
        }
      })
      
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
