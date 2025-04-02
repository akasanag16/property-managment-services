const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration, validateLogin, validate } = require('../middleware/validation');

// Register new user
router.post('/register', validateRegistration, validate, async (req, res) => {
  try {
    const { email, password, userType, name, phone, companyName, serviceTypes } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      userType,
      name,
      phone,
      ...(userType === 'serviceProvider' && { companyName, serviceTypes })
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        phone: user.phone,
        ...(user.userType === 'serviceProvider' && {
          companyName: user.companyName,
          serviceTypes: user.serviceTypes
        })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', validateLogin, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        phone: user.phone,
        ...(user.userType === 'serviceProvider' && {
          companyName: user.companyName,
          serviceTypes: user.serviceTypes
        })
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

module.exports = router; 