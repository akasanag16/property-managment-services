const mongoose = require('mongoose');

const rentPaymentSchema = new mongoose.Schema({
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paidDate: {
    type: Date
  },
  remindersSent: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['initial', 'reminder', 'overdue'],
      required: true
    }
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Create index for querying payments by due date
rentPaymentSchema.index({ dueDate: 1, status: 1 });

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);

module.exports = RentPayment; 