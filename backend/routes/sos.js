const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middleware/errorHandler');
const { protect, requireAdmin } = require('../middleware/auth');
const SOS = require('../models/SOS');
const User = require('../models/User');
const EmergencyService = require('../models/EmergencyService');

const router = express.Router();

// @route   POST /api/sos
// @desc    Create SOS alert
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { 
    lat, 
    lng, 
    address, 
    emergencyType, 
    description,
    accuracy 
  } = req.body;

  if (!lat || !lng) {
    throw createValidationError('location', 'Latitude and longitude are required');
  }

  if (!emergencyType) {
    throw createValidationError('emergencyType', 'Emergency type is required');
  }

  // Create SOS alert
  const sosData = {
    user: req.user._id,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
      address,
      accuracy
    },
    emergencyType,
    description
  };

  const sos = await SOS.create(sosData);

  // Find nearby emergency services
  const coordinates = [parseFloat(lng), parseFloat(lat)];
  const nearbyServices = await EmergencyService.findNearby(coordinates, {
    maxDistance: 5,
    type: emergencyType === 'medical' ? 'hospital' : 
          emergencyType === 'police' ? 'police' : 
          emergencyType === 'fire' ? 'fire' : null
  });

  // Add contacted services to SOS
  for (const service of nearbyServices.slice(0, 3)) { // Contact top 3 nearest services
    await sos.addContactedService(service._id);
  }

  // Send notifications to emergency contacts
  if (req.user.emergencyContacts && req.user.emergencyContacts.length > 0) {
    const contacts = req.user.emergencyContacts.map(contact => contact.phone);
    
    // Mark SMS notification as sent (implement actual SMS sending)
    await sos.markNotificationSent('sms', contacts, 
      `SOS Alert: ${req.user.name} needs help at ${address || 'current location'}. Emergency type: ${emergencyType}`
    );

    // Mark email notification as sent (implement actual email sending)
    if (req.user.preferences.notificationSettings.email) {
      await sos.markNotificationSent('email', [req.user.email], 
        `SOS Alert for ${req.user.name}`
      );
    }
  }

  res.status(201).json({
    success: true,
    message: 'SOS alert created successfully',
    data: {
      sos,
      contactedServices: nearbyServices.length
    }
  });
}));

// @route   GET /api/sos
// @desc    Get user's SOS alerts
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { status, limit = 20, page = 1 } = req.query;

  let query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const sosAlerts = await SOS.find(query)
    .populate('contactedServices.service', 'name type contact location')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  const total = await SOS.countDocuments(query);

  res.json({
    success: true,
    data: {
      sosAlerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/sos/:id
// @desc    Get single SOS alert
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const sos = await SOS.findById(req.params.id)
    .populate('user', 'name phone email')
    .populate('contactedServices.service', 'name type contact location')
    .populate('assignedTo', 'name phone')
    .populate('resolvedBy', 'name')
    .lean();

  if (!sos) {
    throw createNotFoundError('SOS alert');
  }

  // Check if user owns this SOS or is admin
  if (sos.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw createValidationError('authorization', 'Not authorized to view this SOS alert');
  }

  res.json({
    success: true,
    data: {
      sos
    }
  });
}));

// @route   PUT /api/sos/:id/status
// @desc    Update SOS alert status (Admin only)
// @access  Private
router.put('/:id/status', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    throw createValidationError('status', 'Status is required');
  }

  const sos = await SOS.findById(req.params.id);
  if (!sos) {
    throw createNotFoundError('SOS alert');
  }

  await sos.updateStatus(status, notes);

  // If resolved, calculate response time
  if (status === 'resolved') {
    await sos.calculateResponseTime();
  }

  res.json({
    success: true,
    message: 'SOS status updated successfully',
    data: {
      sos
    }
  });
}));

// @route   PUT /api/sos/:id/service-response
// @desc    Update service response for SOS (Admin only)
// @access  Private
router.put('/:id/service-response', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { serviceId, response, estimatedArrival, notes } = req.body;

  if (!serviceId || !response) {
    throw createValidationError('service', 'Service ID and response are required');
  }

  const sos = await SOS.findById(req.params.id);
  if (!sos) {
    throw createNotFoundError('SOS alert');
  }

  await sos.updateServiceResponse(serviceId, response, estimatedArrival, notes);

  res.json({
    success: true,
    message: 'Service response updated successfully',
    data: {
      sos
    }
  });
}));

// @route   GET /api/sos/admin/active
// @desc    Get all active SOS alerts (Admin only)
// @access  Private
router.get('/admin/active', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const activeSos = await SOS.findActive()
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      activeSos
    }
  });
}));

// @route   GET /api/sos/admin/nearby
// @desc    Get nearby SOS alerts (Admin only)
// @access  Private
router.get('/admin/nearby', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { lat, lng, maxDistance = 5 } = req.query;

  if (!lat || !lng) {
    throw createValidationError('location', 'Latitude and longitude are required');
  }

  const coordinates = [parseFloat(lng), parseFloat(lat)];
  const nearbySos = await SOS.findNearby(coordinates, parseFloat(maxDistance));

  res.json({
    success: true,
    data: {
      nearbySos,
      searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    }
  });
}));

// @route   POST /api/sos/:id/assign
// @desc    Assign SOS alert to admin (Admin only)
// @access  Private
router.post('/:id/assign', protect, requireAdmin, asyncHandler(async (req, res) => {
  const sos = await SOS.findById(req.params.id);
  if (!sos) {
    throw createNotFoundError('SOS alert');
  }

  sos.assignedTo = req.user._id;
  await sos.save();

  res.json({
    success: true,
    message: 'SOS alert assigned successfully',
    data: {
      sos
    }
  });
}));

// @route   POST /api/sos/:id/resolve
// @desc    Resolve SOS alert (Admin only)
// @access  Private
router.post('/:id/resolve', protect, requireAdmin, asyncHandler(async (req, res) => {
  const { resolutionNotes } = req.body;

  const sos = await SOS.findById(req.params.id);
  if (!sos) {
    throw createNotFoundError('SOS alert');
  }

  sos.resolvedBy = req.user._id;
  sos.resolutionNotes = resolutionNotes;
  await sos.updateStatus('resolved', resolutionNotes);
  await sos.calculateResponseTime();

  res.json({
    success: true,
    message: 'SOS alert resolved successfully',
    data: {
      sos
    }
  });
}));

// @route   GET /api/sos/stats
// @desc    Get SOS statistics (Admin only)
// @access  Private
router.get('/stats', protect, requireAdmin, asyncHandler(async (req, res) => {
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

  const stats = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$actualResponseTime' }
      }
    }
  ]);

  const emergencyTypeStats = await SOS.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$emergencyType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const totalSos = await SOS.countDocuments(dateFilter);
  const activeSos = await SOS.countDocuments({ 
    ...dateFilter, 
    status: { $in: ['pending', 'acknowledged', 'responding'] } 
  });

  res.json({
    success: true,
    data: {
      stats,
      emergencyTypeStats,
      totalSos,
      activeSos
    }
  });
}));

module.exports = router; 