const mongoose = require('mongoose');

const lendingRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  rateOfInterest: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  startDate: {
    type: Date,
    required: true
  },
  renewalDate: {
    type: Date,
    required: true
  },
  interest: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Overdue'],
    default: 'Active'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate interest and total before saving
lendingRecordSchema.pre('save', function(next) {
  const days = Math.ceil((this.renewalDate - this.startDate) / (1000 * 60 * 60 * 24));
  const years = days / 365;
  this.interest = Math.round((this.amount * this.rateOfInterest * years) / 100);
  this.total = this.amount + this.interest;
  next();
});

module.exports = mongoose.model('LendingRecord', lendingRecordSchema);
