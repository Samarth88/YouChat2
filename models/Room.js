const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  users: {
    type: [String],
    default: []
  },
  messages: {
    type: [{
        msg: String,
        userSent: [String],
        Date : Date
    }],
    default: []
  },
  createdBy: {
      type: String,
      required: true
  },
  date: {
    type: Date,
    default: new Date()
  },
  roomProfilePicURL: {
    type:String
   },
});

const Room = mongoose.model('Rooms', RoomSchema);

module.exports = Room;