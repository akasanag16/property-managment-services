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
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters long'),
  body('phone')
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage('Please enter a valid phone number (minimum 10 digits)'),
  body('userType')
    .isIn(['tenant', 'owner', 'serviceProvider'])
    .withMessage('Invalid user type'),
  body('companyName')
    .if(body('userType').equals('serviceProvider'))
    .notEmpty()
    .withMessage('Company name is required for service providers'),
  body('serviceTypes')
    .if(body('userType').equals('serviceProvider'))
    .isArray()
    .withMessage('Service types must be an array')
    .custom((value, { req }) => {
      if (!value || value.length === 0) {
        throw new Error('At least one service type is required');
      }
      const validTypes = ['plumbing', 'electrical', 'hvac', 'cleaning', 'pest control', 'general'];
      const invalidTypes = value.filter(type => !validTypes.includes(type.toLowerCase()));
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid service type(s): ${invalidTypes.join(', ')}`);
      }
      return true;
    })
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

// Validation for apartment creation/update
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
    .withMessage('Rent due day must be between 1 and 31'),
  body('status')
    .optional()
    .isIn(['vacant', 'occupied', 'maintenance'])
    .withMessage('Invalid status'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('squareFootage')
    .optional()
    .isNumeric()
    .withMessage('Square footage must be a number')
    .isFloat({ min: 0 })
    .withMessage('Square footage cannot be negative'),
  body('bedrooms')
    .optional()
    .isNumeric()
    .withMessage('Number of bedrooms must be a number')
    .isFloat({ min: 0 })
    .withMessage('Number of bedrooms cannot be negative'),
  body('bathrooms')
    .optional()
    .isNumeric()
    .withMessage('Number of bathrooms must be a number')
    .isFloat({ min: 0 })
    .withMessage('Number of bathrooms cannot be negative')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateApartment,
  validate
}; 