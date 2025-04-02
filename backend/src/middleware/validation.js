const { body, validationResult } = require('express-validator');

// Validation for user registration
const validateRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .matches(/^\+?[1-9]\d{9,14}$/)
    .withMessage('Please enter a valid phone number with or without country code'),
  body('userType')
    .isIn(['owner', 'tenant', 'serviceProvider'])
    .withMessage('Invalid user type'),
  body('companyName')
    .if(body('userType').equals('serviceProvider'))
    .notEmpty()
    .withMessage('Company name is required for service providers'),
  body('serviceTypes')
    .if(body('userType').equals('serviceProvider'))
    .isArray()
    .withMessage('Service types must be an array')
];

// Validation for login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation for apartment creation
const validateApartment = [
  body('apartmentNumber')
    .notEmpty()
    .withMessage('Apartment number is required')
    .trim(),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim(),
  body('rentAmount')
    .isNumeric()
    .withMessage('Rent amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Rent amount cannot be negative'),
  body('rentDueDay')
    .isInt({ min: 1, max: 31 })
    .withMessage('Rent due day must be between 1 and 31')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateApartment,
  validate
}; 