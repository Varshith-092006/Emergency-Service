const express = require('express');
const { asyncHandler, createValidationError } = require('../middleware/errorHandler');
const { protect, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const User = require('../models/User');
const SOS = require('../models/SOS');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists and use env override
const UPLOAD_DIR = process.env.UPLOAD_PATH || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const csvFileFilter = (req, file, cb) => {
  const isCsv = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.toLowerCase().endsWith('.csv');
  if (!isCsv) {
    return cb(new Error('Only CSV files are allowed'));
  }
  cb(null, true);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) }
});

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

// @route   POST /api/admin/services/bulk-upload
// @desc    Bulk upload services via CSV
// @access  Private (Admin)
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

    const requiredTypes = new Set(['hospital', 'police', 'ambulance', 'fire', 'pharmacy', 'veterinary', 'other']);

    const results = [];
    const errors = [];
    let total = 0;

    const stream = fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        total += 1;
        // Normalize headers (handle possible different capitalizations)
        const name = row.name || row.Name || row.service_name || '';
        const type = (row.type || row.Type || '').toString().trim().toLowerCase();
        const category = (row.category || row.Category || 'emergency').toString().trim().toLowerCase();
        const phone = (row.phone || row.Phone || row.contact_phone || '').toString().trim();
        const email = (row.email || row.Email || row.contact_email || '').toString().trim();
        const address = row.address || row.Address || row.fullAddress || '';
        const city = row.city || row.City || '';
        const state = row.state || row.State || '';
        const country = row.country || row.Country || 'India';
        const latitude = parseFloat(row.latitude || row.Latitude || row.lat || '');
        const longitude = parseFloat(row.longitude || row.Longitude || row.lng || '');
        const isActive = String(row.isActive || row.active || 'true').toLowerCase() !== 'false';

        // Validate required fields
        const rowErrors = [];
        if (!name) rowErrors.push('name missing');
        if (!requiredTypes.has(type)) rowErrors.push('invalid type');
        if (!phone) rowErrors.push('phone missing');
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) rowErrors.push('invalid coordinates');
        if (!city) rowErrors.push('city missing');
        if (!state) rowErrors.push('state missing');

        if (rowErrors.length > 0) {
          errors.push({ row: total, issues: rowErrors });
          return;
        }

        results.push({
          name,
          type,
          category: ['emergency', 'urgent', 'routine'].includes(category) ? category : 'emergency',
          contact: { phone, email },
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(longitude),
              parseFloat(latitude)
            ],
            address: {
              street: '',
              city,
              state,
              pincode: row.pincode || row.Pincode || '',
              country,
              fullAddress: address || `${name}, ${city}, ${state}`
            }
          },
          isActive,
          addedBy: req.user._id
        });
      })
      .on('end', async () => {
        try {
          let inserted = 0;
          if (results.length > 0) {
            const insertResult = await EmergencyService.insertMany(results, { ordered: false });
            inserted = insertResult.length || results.length;
          }

          // Cleanup
          fs.unlink(req.file.path, () => {});

          res.status(201).json({
            success: true,
            message: 'Bulk upload processed',
            data: {
              totalRows: total,
              inserted,
              skipped: errors.length,
              errors
            }
          });
        } catch (err) {
          fs.unlink(req.file.path, () => {});
          throw err;
        }
      })
      .on('error', (err) => {
        fs.unlink(req.file.path, () => {});
        throw err;
      });
  })
);

module.exports = router; 