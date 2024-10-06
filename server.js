const path = require('path');
const http = require('http');
const fs = require('fs');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const { ensureAuthenticated, forwardAuthenticated} = require('./configure/auth');

require('dotenv').config();

// Models
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.io=io;

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Morgan
app.use(morgan('dev'));

// Passport Config
require('./configure/passport')(passport);

// DB Config
const db = process.env.MONGO_URI;

// Connect mongodb
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('connected db');
}).catch(err => console.log(err));


// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set("layout extractScripts", true)
app.set("layout extractStyles", true)


// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({ mongoUrl: db })
    })
);  

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


// ProfilePics
app.use('/profilePics/:id' , ensureAuthenticated, (req,res,next) => {
    filePath = path.join(__dirname,'profilePics',req.params.id);
  
    if(fs.existsSync(filePath))
    {
      res.sendFile(filePath);
    }
    else
    {
      res.sendFile(path.join(__dirname,'profilePics','icon.png'));
    }
})
  
// Room Profile Pics
app.use('/roomProfilePics/:id' , ensureAuthenticated, (req,res,next) => {
    filePath = path.join(__dirname,'roomProfilePics',req.params.id);

    if( req.user.rooms.includes(req.params.id.replace('.png', '')) )
    {
        if(fs.existsSync(filePath))
        {
        res.sendFile(filePath);
        }
        else
        {
        res.sendFile(path.join(__dirname,'roomProfilePics','default.png'));
        }
    }
    else
    {
        console.log('user no present in room');
        res.status(401);
        res.end();
    }
})

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

// Socket io
const onlineUsers = {};

io.on('connection', socket => {
    socket.on('joinRooms', data => {
        if( onlineUsers[data.userId] )
            onlineUsers[data.userId].push(socket.id);
        else
            onlineUsers[data.userId] = [socket.id];
      
        console.log('online',onlineUsers);
  
        userToSend = {};
        data.rooms.forEach(room => {
            socket.join(room.id);
        
            room.users.forEach( user => {
            if( onlineUsers[user] )
                userToSend[user] = 1;
            else
                userToSend[user] = 0;
        })
  
            setTimeout(() => {
                socket.broadcast.to(room.id).emit('online' , { userId: data.userId});
            }, 1500);
        });
  
        socket.emit('online-users' , {onlineUsers: userToSend});
        // console.log('usertoSend',userToSend);
    });
  
    socket.on('leave-room' , data => {
  
        Room.updateOne({ _id: data.room },
            { $pull: { users: data.id } }, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                // console.log("Updated Docs : ", docs);
            }
        });
  
        newMessage = {  msg: `${data.name} left`,
                        userSent: 'bot',
                        Date : new Date()
                    }
      
        Room.updateOne({ _id: data.room },
            {$push:  { messages: newMessage} 
            }, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                // console.log("Updated Docs : ", docs);
            }
        });
  
        User.updateOne({_id: data.id},
            {$pull: { rooms: data.room}},
            (err, docs) => {
                if (err) {
                    console.log(err)
                }
                else {
                    // console.log("Updated Docs : ", docs);
                }
        });
    
        data.Date = newMessage.Date;
        socket.broadcast.to(data.room).emit('user-left' , data);
        console.log(`${data.name} left ${data.room}`);
    })
  
    socket.on('sent-message' , (data) => {
  
        Room.updateOne({ _id: data.room },
        { $push: { messages: data.message } }, function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                // console.log("Updated Docs : ", docs);
            }
        });
  
        socket.broadcast.to(data.room).emit('message' , data);
  
    });
  
    socket.on('disconnect', () =>{
        var keys = Object.keys(onlineUsers)
  
        for(key in keys){
            // console.log(key, onlineUsers[keys[key]]);
            const index = onlineUsers[keys[key]].indexOf(socket.id);
            if (index > -1) {
                onlineUsers[keys[key]].splice(index, 1);
  
                if( onlineUsers[keys[key]].length == 0 )
                {
                    User.findById(keys[key] , (err,user) => {
                    if(err) throw err;
  
                    if(user)
                    {
                        user.rooms.forEach( room => {
                            io.to(room).emit('offline', user.id);
                        })
                    }
                    })
                    delete onlineUsers[keys[key]];
                }
                break;
            }
        }
         // console.log('offline',onlineUsers);
    })
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));