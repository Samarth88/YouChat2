const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//const multer = require('multer');
const path = require('path');
//const fs = require('fs');
const http = require('https');


// Load User model
const User = require('../models/User');
const Room = require('../models/Room');
const { forwardAuthenticated, ensureAuthenticated } = require('../configure/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ authWith: 'local',email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User();
        newUser.name = name;
        newUser.email = email;
        newUser.password = password;
        newUser.authWith = 'local';
        //newUser.profilePicURL = '/profilePics/'+newUser.id;

        //download(`https://ui-avatars.com/api/?name=${name}&background=random&length=1&size=128`, path.join(__dirname,'..','profilePics',newUser.id),(err)=>{ if(err) console.log(err) });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.login(newUser, err => {
                  if(err) throw err;
                  res.redirect('/dashboard');
                })
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


// Profile Name Update
router.post('/updateProfileName' , (req,res) => {
  User.updateOne({ _id: req.user.id },
    { $set: {name: req.body.profileName}}, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        res.redirect('/dashboard');
      }
    });
})

// Room Name Update
router.post('/updateRoomName' , (req,res) => {
  console.log('Body: ',req.body);
  Room.updateOne({ _id: req.body.id },
    { $set: {name: req.body.roomProfileName}}, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        res.redirect('/dashboard');
      }
    });
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  setTimeout(() => {
    res.redirect('/users/login');
  }, 2000);
});

module.exports = router;