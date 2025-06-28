const express = require('express');
const { query, validationResult } = require('express-validator');
const { asyncHandler, createValidationError } = require('../middleware/errorHandler');
const { optionalAuth } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const router = express.Router();

// Helper to calculate distance
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// GET /api/services
router.get('/', optionalAuth, [
  query('type').optional().isIn(['hospital', 'police', 'ambulance', 'fire', 'pharmacy', 'veterinary', 'other']),
  query('category').optional().isIn(['emergency', 'urgent', 'routine']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  query('isOpenNow').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError(errors.array());
  }

  const { 
    type, 
    category, 
    city, 
    state, 
    search, 
    limit = 50, 
    page = 1, 
    sort = '-ratings.average',
    isOpenNow 
  } = req.query;
  
  let query = { isActive: true };
  
  if (type) query.type = type;
  if (category) query.category = category;
  if (city) query['location.address.city'] = { $regex: city, $options: 'i' };
  if (state) query['location.address.state'] = { $regex: state, $options: 'i' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address.city': { $regex: search, $options: 'i' } },
      { 'location.address.state': { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  let services = await EmergencyService.find(query)
    .populate('addedBy', 'name email')
    .sort(sort)
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  // Filter by open now if requested
  if (isOpenNow === 'true') {
    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substring(0, 5);
    
    services = services.filter(service => {
      if (service.operatingHours?.is24Hours) return true;
      const hours = service.operatingHours?.[currentDay];
      return hours?.isOpen && currentTime >= hours.open && currentTime <= hours.close;
    });
  }

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

// GET /api/services/nearby
router.get('/nearby', optionalAuth, [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('isOpenNow').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError(errors.array());
  }

  const { lat, lng, type, category, maxDistance = 10, limit = 20, isOpenNow } = req.query;
  const coordinates = [parseFloat(lng), parseFloat(lat)];

  const services = await EmergencyService.findNearby(coordinates, {
    maxDistance: parseFloat(maxDistance),
    type,
    category,
    limit: parseInt(limit),
    isOpenNow: isOpenNow === 'true'
  });

  // Add distance to each service
  services.forEach(service => {
    service.distance = calculateDistance(
      coordinates[1],
      coordinates[0],
      service.location.coordinates[1],
      service.location.coordinates[0]
    );
  });

  res.json({
    success: true,
    data: {
      services,
      searchLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
      maxDistance: parseFloat(maxDistance)
    }
  });
}));

module.exports = router;