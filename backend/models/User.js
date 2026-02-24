const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['owner', 'tenant', 'none'],
    default: 'none'
  },
  name: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  fcmToken: {
    type: String,
    default: ''
  },
  // Response Time Tracking
  avgResponseTime: {
    type: Number,
    default: 0 // in minutes
  },
  totalResponses: {
    type: Number,
    default: 0
  },
  fastResponseCount: {
    type: Number,
    default: 0 // responses within 10 mins
  },
  lastResponseTime: {
    type: Date
  },
  // Trust Score
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
