const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  userType: {
    type: String,
    enum: {
      values: ['tenant', 'owner', 'serviceProvider'],
      message: '{VALUE} is not a valid user type'
    },
    required: [true, 'User type is required'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
  },
  // Fields for service providers
  companyName: {
    type: String,
    trim: true,
    required: function() {
      return this.userType === 'serviceProvider';
    }
  },
  serviceTypes: [{
    type: String,
    enum: {
      values: ['plumbing', 'electrical', 'hvac', 'cleaning', 'pest control', 'general'],
      message: '{VALUE} is not a valid service type'
    },
    required: function() {
      return this.userType === 'serviceProvider';
    }
  }],
  // Fields for tenants
  currentApartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    index: true
  },
  leaseStart: {
    type: Date
  },
  leaseEnd: {
    type: Date
  },
  rentHistory: [{
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Rent amount cannot be negative']
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending',
      required: true
    }
  }],
  // Fields for owners
  ownedApartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment'
  }],
  // Common fields
  maintenanceRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceRequest'
  }],
  notifications: [{
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      return ret;
    }
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin on successful login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'rentHistory.dueDate': 1 });
userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 