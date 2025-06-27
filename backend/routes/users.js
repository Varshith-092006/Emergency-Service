const express = require('express');
const { asyncHandler, createNotFoundError } = require('../middleware/errorHandler');
const { protect, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private
router.get('/', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { 
    role, 
    isActive, 
    search, 
    limit = 50, 
    page = 1 
  } = req.query;

  let query = {};

  // Apply filters
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private
router.get('/:id', protect, requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .lean();

  if (!user) {
    throw createNotFoundError('User');
  }

  res.json({
    success: true,
    data: {
      user
    }
  });
}));

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private
router.put('/:id/status', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw createNotFoundError('User');
  }

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    }
  });
}));

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private
router.put('/:id/role', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    throw createValidationError('role', 'Invalid role');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw createNotFoundError('User');
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private
router.get('/stats', protect, requireAdmin, asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const regularUsers = await User.countDocuments({ role: 'user' });

  // Users registered in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Users with emergency contacts
  const usersWithContacts = await User.countDocuments({
    'emergencyContacts.0': { $exists: true }
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      adminUsers,
      regularUsers,
      recentUsers,
      usersWithContacts
    }
  });
}));

module.exports = router; 