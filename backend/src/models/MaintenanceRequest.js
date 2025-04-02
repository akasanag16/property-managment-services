const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
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
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'general'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  photos: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completionPhotos: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  startDate: Date,
  completionDate: Date
}, {
  timestamps: true
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest; 