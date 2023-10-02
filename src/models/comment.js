// models/comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  commenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
});


module.exports = mongoose.model('Comment', commentSchema);


