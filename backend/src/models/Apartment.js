const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  apartmentNumber: {
    type: String,
    required: [true, 'Apartment number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9-]{1,10}$/i.test(v);
      },
      message: 'Invalid apartment number format'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters long']
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  rentDueDay: {
    type: Number,
    required: [true, 'Rent due day is required'],
    min: [1, 'Rent due day must be between 1 and 31'],
    max: [31, 'Rent due day must be between 1 and 31']
  },
  rentAmount: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['vacant', 'occupied'],
      message: '{VALUE} is not a valid status'
    },
    default: 'vacant',
    index: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  squareFootage: {
    type: Number,
    min: [0, 'Square footage cannot be negative']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Number of bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Number of bathrooms cannot be negative']
  },
  maintenanceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }]
}, {
  timestamps: true
});

// Create indexes
apartmentSchema.index({ apartmentNumber: 1 }, { unique: true });
apartmentSchema.index({ status: 1 });
apartmentSchema.index({ rentAmount: 1 });

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment; 