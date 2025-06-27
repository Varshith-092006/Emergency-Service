const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, createValidationError, createUnauthorizedError } = require('../middleware/errorHandler');
const { protect, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('validation', errors.array()[0].msg);
  }

  const { name, email, phone, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createValidationError('email', 'User with this email already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Generate token
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('validation', errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createUnauthorizedError('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked()) {
    throw createUnauthorizedError('Account is temporarily locked due to multiple failed login attempts');
  }

  // Check if user is active
  if (!user.isActive) {
    throw createUnauthorizedError('Account is deactivated');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw createUnauthorizedError('Invalid credentials');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emergencyContacts: user.emergencyContacts,
        preferences: user.preferences
      },
      token
    }
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validatePasswordReset, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('validation', errors.array()[0].msg);
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate reset token (you can implement this based on your needs)
  // For now, we'll just acknowledge the request
  // In a real implementation, you'd send an email with a reset link

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('emergencyContacts');

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', protect, asyncHandler(async (req, res) => {
  const { name, phone, preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // Update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emergencyContacts: user.emergencyContacts,
        preferences: user.preferences
      }
    }
  });
}));

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, validatePasswordUpdate, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError('validation', errors.array()[0].msg);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw createUnauthorizedError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @route   POST /api/auth/emergency-contacts
// @desc    Add emergency contact
// @access  Private
router.post('/emergency-contacts', protect, asyncHandler(async (req, res) => {
  const { name, phone, relationship, isPrimary } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  const contact = { name, phone, relationship, isPrimary };
  await user.addEmergencyContact(contact);

  res.status(201).json({
    success: true,
    message: 'Emergency contact added successfully',
    data: {
      emergencyContacts: user.emergencyContacts
    }
  });
}));

// @route   DELETE /api/auth/emergency-contacts/:id
// @desc    Remove emergency contact
// @access  Private
router.delete('/emergency-contacts/:id', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  await user.removeEmergencyContact(id);

  res.json({
    success: true,
    message: 'Emergency contact removed successfully',
    data: {
      emergencyContacts: user.emergencyContacts
    }
  });
}));

// @route   POST /api/auth/update-location
// @desc    Update user's current location
// @access  Private
router.post('/update-location', protect, asyncHandler(async (req, res) => {
  const { lat, lng, address } = req.body;

  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    throw createValidationError('location', 'Latitude and longitude are required');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  await user.updateLocation(lat, lng, address);

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      currentLocation: user.currentLocation
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a blacklist for tokens if needed
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw createUnauthorizedError('User not found');
  }

  // Generate new token
  const token = user.generateAuthToken();

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token
    }
  });
}));

module.exports = router; 