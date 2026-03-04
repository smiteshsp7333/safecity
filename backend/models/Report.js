const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  },
  address: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['harassment', 'theft', 'assault', 'unsafe_area', 'poor_lighting', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'fake'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);