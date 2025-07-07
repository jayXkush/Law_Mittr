const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  anonymous: { type: Boolean, default: true },
});

const communityPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: [commentSchema],
  anonymous: { type: Boolean, default: true },
});

module.exports = mongoose.model('CommunityPost', communityPostSchema); 