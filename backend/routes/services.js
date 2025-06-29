const express = require('express');
const { query, validationResult } = require('express-validator');
const { asyncHandler, createValidationError } = require('../middleware/errorHandler');
const { optionalAuth, protect, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const router = express.Router();

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_LIMIT = 100;

// Helper function to clean query params
const cleanParams = (params) => {
  const cleaned = { ...params };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === '') {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// GET /api/services
router.get('/', optionalAuth, [
  query('type').optional().isIn(['hospital', 'police', 'ambulance', 'fire', 'pharmacy', 'veterinary', 'other']),
  query('category').optional().isIn(['emergency', 'urgent', 'routine']),
  query('limit').optional().isInt({ min: 1, max: MAX_LIMIT }).default(50),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('isOpenNow').optional().isBoolean(),
  query('search').optional().trim()
], asyncHandler(async (req, res) => {
  req.setTimeout(DEFAULT_TIMEOUT);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError(errors.array());
  }

  const params = cleanParams({
    ...req.query,
    limit: parseInt(req.query.limit),
    page: parseInt(req.query.page)
  });

  let dbQuery = { isActive: true };
  const queryOptions = {
    maxTimeMS: DEFAULT_TIMEOUT,
    limit: params.limit,
    skip: (params.page - 1) * params.limit
  };

  // Apply filters
  if (params.type) dbQuery.type = params.type;
  if (params.category) dbQuery.category = params.category;
  if (params.city) dbQuery['location.address.city'] = { $regex: params.city, $options: 'i' };
  if (params.state) dbQuery['location.address.state'] = { $regex: params.state, $options: 'i' };

  // Apply search
  if (params.search) {
    dbQuery.$or = [
      { name: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } },
      { 'location.address.city': { $regex: params.search, $options: 'i' } },
      { 'location.address.state': { $regex: params.search, $options: 'i' } },
      { tags: { $in: [new RegExp(params.search, 'i')] } }
    ];
  }

  let services = await EmergencyService.find(dbQuery)
    .select('name type category contact location operatingHours ratings isActive')
    .populate('addedBy', 'name email')
    .sort(params.sort || '-ratings.average')
    .setOptions(queryOptions)
    .lean();

  const total = await EmergencyService.countDocuments(dbQuery).maxTimeMS(DEFAULT_TIMEOUT);

  // Filter by open now if requested
  if (params.isOpenNow === 'true') {
    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substring(0, 5);

    services = services.filter(service => {
      if (service.operatingHours?.is24Hours) return true;
      const hours = service.operatingHours?.[currentDay];
      return hours?.isOpen && currentTime >= hours.open && currentTime <= hours.close;
    });
  }

  res.json({
    success: true,
    data: {
      services,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit)
      }
    }
  });
}));

// GET /api/services/nearby
router.get('/nearby', optionalAuth, [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 100 }).default(10),
  query('limit').optional().isInt({ min: 1, max: MAX_LIMIT }).default(20),
  query('isOpenNow').optional().isBoolean()
], asyncHandler(async (req, res) => {
  req.setTimeout(DEFAULT_TIMEOUT);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError(errors.array());
  }

  const params = cleanParams({
    ...req.query,
    lat: parseFloat(req.query.lat),
    lng: parseFloat(req.query.lng),
    maxDistance: parseFloat(req.query.maxDistance),
    limit: parseInt(req.query.limit)
  });

  const services = await EmergencyService.findNearby(
    params.lat,
    params.lng,
    params.maxDistance,
    params.type
  );

  res.json({
    success: true,
    data: {
      services,
      searchLocation: { lat: params.lat, lng: params.lng },
      maxDistance: params.maxDistance
    }
  });
}));

// ──────────────────────────────────────────────
// CRUD Routes for Single Emergency Service
// ──────────────────────────────────────────────

// GET /api/services/:id
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const service = await EmergencyService.findById(req.params.id)
    .populate('addedBy', 'name email');
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, data: service });
}));

// PUT /api/services/:id
router.put('/:id', protect, requireAdmin, asyncHandler(async (req, res) => {
  const updated = await EmergencyService.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, data: updated });
}));

// DELETE /api/services/:id
router.delete('/:id', protect, requireAdmin, asyncHandler(async (req, res) => {
  const deleted = await EmergencyService.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, data: deleted });
}));

module.exports = router;
