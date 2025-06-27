const express = require('express');
const { query, body, validationResult } = require('express-validator');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middleware/errorHandler');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const router = express.Router();

// @route   GET /api/services
// @desc    Get all emergency services with filters
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const {
    type,
    category,
    city,
    state,
    search,
    limit = 50,
    page = 1,
    sort = 'name'
  } = req.query;

  let query = { isActive: true };

  // Apply filters
  if (type) query.type = type;
  if (category) query.category = category;
  if (city) query['location.address.city'] = { $regex: city, $options: 'i' };
  if (state) query['location.address.state'] = { $regex: state, $options: 'i' };

  // Apply search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address.city': { $regex: search, $options: 'i' } },
      { 'location.address.state': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const services = await EmergencyService.find(query)
    .populate('addedBy', 'name email')
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip)
    .lean();

  // Get total count
  const total = await EmergencyService.countDocuments(query);

  res.json({
    success: true,
    data: {
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/services/nearby
// @desc    Find nearby emergency services
// @access  Public
router.get('/nearby', optionalAuth, asyncHandler(async (req, res) => {
  const {
    lat,
    lng,
    type,
    category,
    maxDistance = 10,
    limit = 20
  } = req.query;

  if (!lat || !lng) {
    throw createValidationError('location', 'Latitude and longitude are required');
  }

  const coordinates = [parseFloat(lng), parseFloat(lat)];
  const options = {
    maxDistance: parseFloat(maxDistance),
    type: type || null,
    category: category || null,
    limit: parseInt(limit)
  };

  const services = await EmergencyService.findNearby(coordinates, options);

  res.json({
    success: true,
    data: {
      services,
      searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    }
  });
}));

// @route   GET /api/services/:id
// @desc    Get single emergency service
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const service = await EmergencyService.findById(req.params.id)
    .populate('addedBy', 'name email')
    .lean();

  if (!service) {
    throw createNotFoundError('Emergency service');
  }

  res.json({
    success: true,
    data: {
      service
    }
  });
}));

// @route   POST /api/services
// @desc    Create new emergency service (Admin only)
// @access  Private
router.post('/', protect, requireAdmin, asyncHandler(async (req, res) => {
  const serviceData = {
    ...req.body,
    addedBy: req.user._id
  };

  const service = await EmergencyService.create(serviceData);

  res.status(201).json({
    success: true,
    message: 'Emergency service created successfully',
    data: {
      service
    }
  });
}));

// @route   PUT /api/services/:id
// @desc    Update emergency service (Admin only)
// @access  Private
router.put('/:id', protect, requireAdmin, asyncHandler(async (req, res) => {
  const service = await EmergencyService.findById(req.params.id);
  if (!service) {
    throw createNotFoundError('Emergency service');
  }

  // Update service
  Object.keys(req.body).forEach(key => {
    if (key !== 'addedBy') {
      service[key] = req.body[key];
    }
  });

  await service.save();

  res.json({
    success: true,
    message: 'Emergency service updated successfully',
    data: {
      service
    }
  });
}));

// @route   DELETE /api/services/:id
// @desc    Delete emergency service (Admin only)
// @access  Private
router.delete('/:id', protect, requireAdmin, asyncHandler(async (req, res) => {
  const service = await EmergencyService.findById(req.params.id);
  if (!service) {
    throw createNotFoundError('Emergency service');
  }

  service.isActive = false;
  await service.save();

  res.json({
    success: true,
    message: 'Emergency service deleted successfully'
  });
}));



module.exports = router; 