const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    get: (date) => date ? date.toISOString().split('T')[0] : null
  },
  plastic: {
    type: Number,
    default: 0,
    min: 0
  },
  organic: {
    type: Number,
    default: 0,
    min: 0
  },
  paper: {
    type: Number,
    default: 0,
    min: 0
  },
  glass: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for userId and date
wasteLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Update updatedAt on save
wasteLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WasteLog', wasteLogSchema);