const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  apartmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rentDueDay: {
    type: Number,
    required: true,
    min: 1,
    max: 31
  },
  rentAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied'],
    default: 'vacant'
  },
  maintenanceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }]
}, {
  timestamps: true
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment; 