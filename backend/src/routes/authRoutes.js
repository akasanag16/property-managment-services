const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin, validate } = require('../middleware/validation');

// Register new user
router.post('/register', validateRegistration, validate, async (req, res) => {
  try {
    const { 
      email, 
      password, 
      userType, 
      firstName,
      lastName,
      phone,
      companyName, 
      serviceTypes 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate service provider specific fields
    if (userType === 'serviceProvider') {
      if (!companyName) {
        return res.status(400).json({ message: 'Company name is required for service providers' });
      }
      if (!serviceTypes || serviceTypes.length === 0) {
        return res.status(400).json({ message: 'At least one service type is required' });
      }
      // Validate service types
      const validServiceTypes = ['plumbing', 'electrical', 'hvac', 'cleaning', 'pest control', 'general'];
      const invalidTypes = serviceTypes.filter(type => !validServiceTypes.includes(type.toLowerCase()));
      if (invalidTypes.length > 0) {
        return res.status(400).json({ 
          message: `Invalid service type(s): ${invalidTypes.join(', ')}` 
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      userType: userType || 'tenant',
      firstName,
      lastName,
      phone,
      isVerified: true,
      ...(userType === 'serviceProvider' && { 
        companyName, 
        serviceTypes: serviceTypes.map(type => type.toLowerCase())
      })
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        phone: user.phone,
        isVerified: true,
        ...(user.userType === 'serviceProvider' && {
          companyName: user.companyName,
          serviceTypes: user.serviceTypes
        })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Error creating user', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login user
router.post('/login', validateLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    
    // Log the user lookup result
    console.log('User lookup result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      console.log('Login failed: User not found -', email);
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch ? 'Password correct' : 'Password incorrect');
    
    if (!isMatch) {
      console.log('Login failed: Invalid password for user -', email);
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('Login successful for user:', email);

    res.json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        phone: user.phone,
        isVerified: user.isVerified,
        ...(user.userType === 'serviceProvider' && {
          companyName: user.companyName,
          serviceTypes: user.serviceTypes
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while logging in. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 