const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  apartmentNumber: {
    type: String,
    required: [true, 'Apartment number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Allow alphanumeric characters, hyphens, and spaces
        return /^[A-Za-z0-9\- ]{1,20}$/i.test(v);
      },
      message: 'Apartment number can only contain letters, numbers, hyphens, and spaces (max 20 characters)'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters long'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    validate: {
      validator: async function(value) {
        if (!value) return true; // Allow null for vacant apartments
        try {
          const user = await mongoose.model('User').findById(value);
          return user && user.userType === 'tenant';
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid tenant reference'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true,
    validate: {
      validator: async function(value) {
        try {
          const user = await mongoose.model('User').findById(value);
          return user && user.userType === 'owner';
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid owner reference'
    }
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
      values: ['vacant', 'occupied', 'maintenance'],
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
  }],
  lastMaintenanceDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index for apartmentNumber and owner to ensure uniqueness per owner
apartmentSchema.index({ apartmentNumber: 1, owner: 1 }, { unique: true });
apartmentSchema.index({ status: 1 });
apartmentSchema.index({ rentAmount: 1 });

// Pre-save middleware to sync status with tenant
apartmentSchema.pre('save', function(next) {
  if (this.isModified('currentTenant')) {
    this.status = this.currentTenant ? 'occupied' : 'vacant';
  }
  if (this.isModified('status') && this.status === 'vacant' && this.currentTenant) {
    this.currentTenant = null;
  }
  next();
});

// Clean up related data when an apartment is deleted
apartmentSchema.pre('remove', async function(next) {
  try {
    // Remove apartment reference from current tenant if exists
    if (this.currentTenant) {
      await mongoose.model('User').updateOne(
        { _id: this.currentTenant },
        { $unset: { currentApartment: 1 } }
      );
    }

    // Remove apartment from owner's ownedApartments array
    await mongoose.model('User').updateOne(
      { _id: this.owner },
      { $pull: { ownedApartments: this._id } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment; 