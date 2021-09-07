const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  authWith: {
    type: String,
    required: true
  },
  password  : String,
  //googleId  : String,
  email     : String,
  name: {
    type: String,
    required: true
  },
  //profilePicURL: {
  //  type:String
  //},
  rooms: {
    type: [String],
    default: []
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;