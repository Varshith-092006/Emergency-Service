const express = require('express');
const { asyncHandler, createValidationError } = require('../middleware/errorHandler');
const { protect, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const User = require('../models/User');
const SOS = require('../models/SOS');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private
router.get('/dashboard', protect, requireAdmin, asyncHandler(async (req, res) => {
  const totalServices = await EmergencyService.countDocuments({ isActive: true });
  const totalUsers = await User.countDocuments({ isActive: true });
  const totalSos = await SOS.countDocuments();
  const activeSos = await SOS.countDocuments({
    status: { $in: ['pending', 'acknowledged', 'responding'] }
  });

  const serviceTypes = await EmergencyService.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalServices,
        totalUsers,
        totalSos,
        activeSos
      },
      serviceTypes
    }
  });
}));

// @route   GET /api/admin/analytics/services
// @desc    Get service analytics
// @access  Private
router.get('/analytics/services', protect, requireAdmin, asyncHandler(async (req, res) => {
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

  // Service type distribution
  const serviceTypeDistribution = await EmergencyService.aggregate([
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

  // Services by city
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
      serviceTypeDistribution,
      servicesByCity,
      servicesByState
    }
  });
}));

// @route   GET /api/admin/analytics/sos
// @desc    Get SOS analytics
// @access  Private
router.get('/analytics/sos', protect, requireAdmin, asyncHandler(async (req, res) => {
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

  // SOS by emergency type
  const sosByType = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$actualResponseTime' }
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
        maxResponseTime: { $max: '$actualResponseTime' },
        count: { $sum: 1 }
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

// routes/admin.js
// …top of file stays the same…

router.post(
  '/services/bulk-upload',
  protect,
  requireAdmin,
  upload.single('csv'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw createValidationError('file', 'CSV file is required');
    }

    const csv = require('csv-parser');
    const fs  = require('fs');
    const results = [];

    // Parse CSV to JS objects
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          name: row.name,
          type: row.type,                       // must match enum
          category: row.category || 'emergency',
          contact: { phone: row.phone, email: row.email },
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(row.longitude || 0),
              parseFloat(row.latitude  || 0)
            ],
            address: { fullAddress: row.address }
          },
          isActive: row.isActive !== 'false',
          addedBy:  req.user._id               // ✅ inject the uploader!
        });
      })
      .on('end', async () => {
        try {
          await EmergencyService.insertMany(results, { ordered: false });
          fs.unlinkSync(req.file.path);        // clean up temp file
          res.status(201).json({
            success: true,
            message: `${results.length} services imported successfully`
          });
        } catch (err) {
          fs.unlinkSync(req.file.path);
          // Forward to your global error handler
          throw err;
        }
      });
  })
);


module.exports = router; 