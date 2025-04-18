const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Check for token in different places
    const token = 
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.cookies?.token ||
      req.query?.token;
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required. Please log in.' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is about to expire (within 1 hour)
      const tokenExp = new Date(decoded.exp * 1000);
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      
      const user = await User.findById(decoded.userId)
        .select('+password')
        .populate('currentApartment', 'apartmentNumber location');
      
      if (!user) {
        return res.status(401).json({ 
          status: 'error',
          message: 'User not found. Please log in again.' 
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          status: 'error',
          message: 'Please verify your email address to continue.'
        });
      }

      // Update last activity
      user.lastLogin = new Date();
      await user.save();

      // If token is about to expire, generate a new one
      if (tokenExp < oneHourFromNow) {
        const newToken = jwt.sign(
          { userId: user._id, userType: user.userType },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        res.setHeader('New-Token', newToken);
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Your session has expired. Please log in again.'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid authentication token. Please log in again.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred during authentication. Please try again.' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        status: 'error',
        message: `Access denied. ${req.user.userType} cannot perform this action.`
      });
    }

    next();
  };
};

module.exports = { auth, authorize }; 