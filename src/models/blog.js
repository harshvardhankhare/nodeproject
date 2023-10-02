const mongoose = require('mongoose');

 // Update the path to the User model file as needed

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  blogImage:String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  likes: [  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  }],
  preview: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
   comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment', // Reference to the Comment model
    },
  ],
});

module.exports = mongoose.model('Blog', blogSchema);