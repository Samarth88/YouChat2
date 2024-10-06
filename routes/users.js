const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('https');

var storageProfilePic = multer.diskStorage({
    destination: (req,file,cb) => {
        fileDest = path.join(__dirname,'..','profilePics');
        cb(null,fileDest);
    },
    filename: (req,file,cb) => {
        fileName = req.user.id + '.png';
        filePath = path.join(__dirname, '..', 'profilePics', fileName);

        if(fs.existsSync(filePath))
        {
            fs.unlinkSync(filePath);
        }
        cb(null,fileName);
    }
});

var profileUpload = multer({
  storage: storageProfilePic
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype == "image/*") {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error('Only images are allowed!'));
  //   }
  // }
});

var storageRoomPic = multer.diskStorage({
    destination: (req,file,cb) => {
        fileDest = path.join(__dirname,'..','roomProfilePics');
        cb(null,fileDest);
    },
    filename: (req,file,cb) => {
        fileName = req.body.id + '.png';
        filePath = path.join(__dirname, '..', 'roomProfilePics', fileName);

        if(fs.existsSync(filePath))
        {
            fs.unlinkSync(filePath);
        }
        cb(null,fileName);
    }
});

var uploadRoomPic = multer({
    storage: storageRoomPic
});

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
                newUser.profilePicURL = '/profilePics/' + newUser.id + '.png';

                download(`https://ui-avatars.com/api/?name=${name}&background=random&length=1&size=128`, path.join(__dirname,'..','profilePics',newUser.id+'.png'),(err)=>{ if(err) console.log(err) });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                          .save()
                          .then(user => {
                            req.login(newUser, err => {
                              if(err) throw err;
                              res.render('profile',{user:req.user});
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

// Profile Pic Upload
router.post('/updateProfilePic' , ensureAuthenticated, profileUpload.single('profilePic'), (req,res) => {
    User.updateOne({ _id: req.user.id },
      { $set: {profilePicURL: '/profilePics/' + req.file.filename}}, function (err, docs) {
        if (err) {
          console.log(err)
        }
        else {
          res.redirect('/dashboard');
        }
    });
});

// Room Profile Pic Upload
router.post('/updateRoomProfilePic' , ensureAuthenticated, uploadRoomPic.single('roomProfilePic'), (req,res) => {
  Room.updateOne({ _id: req.body.id },
    { $set: {roomProfilePicURL: '/roomProfilePics/' + req.file.filename}}, function (err, docs) {
      if (err) {
        console.log(err)
      }
      else {
        res.redirect('/dashboard');
      }
    });
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


// Google Login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }))

// Google callback
router.get( '/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', successRedirect: '/dashboard' }))


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  setTimeout(() => {
    res.redirect('/users/login');
  }, 2000);
});

module.exports = router;