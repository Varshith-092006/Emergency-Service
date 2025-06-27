const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const SOS = require('../models/SOS');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get overview analytics
// @access  Private
router.get('/overview', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  // Basic counts
  const totalServices = await EmergencyService.countDocuments({ isActive: true });
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalSos = await SOS.countDocuments(dateFilter);
  const activeSos = await SOS.countDocuments({
    ...dateFilter,
    status: { $in: ['pending', 'acknowledged', 'responding'] }
  });

  // Service distribution
  const serviceDistribution = await EmergencyService.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // SOS distribution
  const sosDistribution = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      counts: {
        totalServices,
        totalUsers,
        totalSos,
        activeSos
      },
      serviceDistribution,
      sosDistribution
    }
  });
}));

// @route   GET /api/analytics/services
// @desc    Get service analytics
// @access  Private
router.get('/services', protect, requireAdmin, asyncHandler(async (req, res) => {
  // Service type distribution
  const serviceTypes = await EmergencyService.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgRating: { $avg: '$ratings.average' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Services by location
  const servicesByCity = await EmergencyService.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$location.address.city',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Services by state
  const servicesByState = await EmergencyService.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$location.address.state',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      serviceTypes,
      servicesByCity,
      servicesByState
    }
  });
}));

// @route   GET /api/analytics/sos
// @desc    Get SOS analytics
// @access  Private
router.get('/sos', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  // SOS by type
  const sosByType = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // SOS by status
  const sosByStatus = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Response time analysis
  const responseTimeAnalysis = await SOS.aggregate([
    { $match: { ...dateFilter, actualResponseTime: { $exists: true } } },
    {
      $group: {
        _id: '$emergencyType',
        avgResponseTime: { $avg: '$actualResponseTime' },
        minResponseTime: { $min: '$actualResponseTime' },
        maxResponseTime: { $max: '$actualResponseTime' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      sosByType,
      sosByStatus,
      responseTimeAnalysis
    }
  });
}));

module.exports = router; 