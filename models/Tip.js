const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['plastic', 'organic', 'paper', 'glass', 'general']
  },
  threshold: {
    type: Number,
    required: true,
    min: 0
  },
  text: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

tipSchema.index({ category: 1, threshold: 1 });

module.exports = mongoose.model('Tip', tipSchema);