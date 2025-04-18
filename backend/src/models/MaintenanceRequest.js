const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const maintenanceRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: [true, 'Apartment is required'],
    validate: {
      validator: async function(value) {
        try {
          const apartment = await mongoose.model('Apartment').findById(value);
          return apartment && apartment.currentTenant?.toString() === this.tenant?.toString();
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid apartment reference or tenant not assigned to this apartment'
    },
    index: true
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tenant is required'],
    validate: {
      validator: async function(value) {
        try {
          const user = await mongoose.model('User').findById(value);
          return user && user.userType === 'tenant';
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid tenant reference'
    },
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    validate: {
      validator: async function(value) {
        try {
          const apartment = await mongoose.model('Apartment').findById(this.apartment);
          return apartment && apartment.owner.toString() === value.toString();
        } catch (error) {
          return false;
        }
      },
      message: 'Owner must be the owner of the apartment'
    },
    index: true
  },
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(value) {
        if (!value) return true; // Allow null/undefined
        try {
          const user = await mongoose.model('User').findById(value);
          return user && user.userType === 'serviceProvider';
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid service provider reference'
    },
    index: true
  },
  type: {
    type: String,
    enum: {
      values: ['plumbing', 'electrical', 'hvac', 'cleaning', 'pest control', 'general'],
      message: '{VALUE} is not a valid maintenance type'
    },
    required: [true, 'Maintenance type is required'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'emergency'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium',
    required: true,
    index: true
  },
  estimatedCost: {
    amount: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP']
    },
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date
  },
  photos: [{
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completionPhotos: [{
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
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
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    attachments: [{
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'document', 'other'],
        default: 'other'
      }
    }],
    timestamp: {
      type: Date,
      default: Date.now
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  completionDetails: {
    photos: [{
      url: {
        type: String,
        required: true
      },
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    finalCost: {
      amount: {
        type: Number,
        min: [0, 'Final cost cannot be negative']
      },
      currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP']
      }
    },
    warranty: {
      period: {
        type: Number,
        min: [0, 'Warranty period cannot be negative']
      },
      details: String,
      expiryDate: Date
    }
  },
  schedule: {
    preferredDates: [{
      date: {
        type: Date,
        required: true
      },
      timeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
        required: true
      }
    }],
    confirmedDate: Date,
    confirmedTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening']
    }
  },
  startDate: Date,
  completionDate: Date,
  nextFollowUpDate: Date,
  rating: {
    score: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    givenAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
maintenanceRequestSchema.index({ 'schedule.confirmedDate': 1 });
maintenanceRequestSchema.index({ nextFollowUpDate: 1 });
maintenanceRequestSchema.index({ createdAt: 1 });
maintenanceRequestSchema.index({ status: 1, priority: 1 });
maintenanceRequestSchema.index({ type: 1 });
maintenanceRequestSchema.index({ status: 1, createdAt: -1 });
maintenanceRequestSchema.index({ tenant: 1, status: 1 });
maintenanceRequestSchema.index({ owner: 1, status: 1 });

// Virtual field for request age
maintenanceRequestSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to validate dates and status transitions
maintenanceRequestSchema.pre('save', function(next) {
  // Validate completion date
  if (this.completionDate && this.startDate && this.completionDate < this.startDate) {
    return next(new Error('Completion date cannot be earlier than start date'));
  }

  // Validate status transitions
  if (this.isModified('status')) {
    const validTransitions = {
      pending: ['assigned', 'cancelled'],
      assigned: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (this.isNew) {
      if (this.status !== 'pending') {
        return next(new Error('New requests must have pending status'));
      }
    } else {
      const oldStatus = this._oldStatus || 'pending';
      if (!validTransitions[oldStatus].includes(this.status)) {
        return next(new Error(`Invalid status transition from ${oldStatus} to ${this.status}`));
      }
    }
  }

  // Store the current status for future transition validation
  this._oldStatus = this.status;
  next();
});

// Middleware to update related models
maintenanceRequestSchema.post('save', async function(doc) {
  try {
    // Update apartment's maintenance history
    await mongoose.model('Apartment').findByIdAndUpdate(
      doc.apartment,
      { 
        $addToSet: { maintenanceHistory: doc._id },
        $set: { lastMaintenanceDate: doc.createdAt }
      }
    );

    // Update users' maintenance requests
    const userIds = [doc.tenant, doc.owner];
    if (doc.serviceProvider) userIds.push(doc.serviceProvider);

    await mongoose.model('User').updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { maintenanceRequests: doc._id } }
    );

    // Create notifications for all involved parties
    const notification = {
      message: `Maintenance request "${doc.title}" has been ${doc.status}`,
      type: 'info'
    };

    await mongoose.model('User').updateMany(
      { _id: { $in: userIds } },
      { 
        $push: { 
          notifications: {
            ...notification,
            createdAt: new Date()
          }
        }
      }
    );
  } catch (error) {
    console.error('Error in maintenance request post-save middleware:', error);
  }
});

// Clean up related data when a maintenance request is deleted
maintenanceRequestSchema.pre('remove', async function(next) {
  try {
    // Delete all photos
    const allPhotos = [...(this.photos || []), ...(this.completionPhotos || [])];
    for (const photo of allPhotos) {
      try {
        await fs.unlink(photo.path);
      } catch (error) {
        console.error(`Failed to delete photo ${photo.path}:`, error);
      }
    }

    // Remove reference from apartment
    await mongoose.model('Apartment').updateOne(
      { _id: this.apartment },
      { $pull: { maintenanceHistory: this._id } }
    );

    // Remove references from users
    const userIds = [this.tenant, this.owner];
    if (this.serviceProvider) userIds.push(this.serviceProvider);

    await mongoose.model('User').updateMany(
      { _id: { $in: userIds } },
      { $pull: { maintenanceRequests: this._id } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest; 