const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize }; 