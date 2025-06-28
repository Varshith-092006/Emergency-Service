const express = require('express');
const { query, validationResult } = require('express-validator');
const { asyncHandler, createValidationError, createNotFoundError } = require('../middleware/errorHandler');
const { protect, optionalAuth, requireAdmin } = require('../middleware/auth');
const EmergencyService = require('../models/EmergencyService');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();

const validateCoordinates = (coords) => {
  return Array.isArray(coords) && 
         coords.length === 2 &&
         !isNaN(coords[0]) && 
         !isNaN(coords[1]) &&
         coords[0] >= -180 && coords[0] <= 180 &&
         coords[1] >= -90 && coords[1] <= 90;
};

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

// Get all services
router.get('/', optionalAuth, [
  query('type').optional().isIn(['hospital', 'police', 'ambulance', 'fire', 'pharmacy', 'veterinary', 'other']),
  query('category').optional().isIn(['emergency', 'urgent', 'routine']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createValidationError(errors.array());
  }

  const { type, category, city, state, search, limit = 50, page = 1, sort = '-ratings.average' } = req.query;
  
  const query = { isActive: true };
  
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

  const [services, total] = await Promise.all([
    EmergencyService.find(query)
      .populate('addedBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
    EmergencyService.countDocuments(query)
  ]);

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

// Get nearby services
router.get('/nearby', optionalAuth, [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('maxDistance').optional().isFloat({ min: 0.1, max: 100 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

// Bulk upload services
router.post('/bulk-upload', protect, requireAdmin, upload.single('csv'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createValidationError('file', 'CSV file is required');
  }

  const results = [];
  const errors = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const coords = [
            parseFloat(data.longitude || 0),
            parseFloat(data.latitude || 0)
          ];

          if (!validateCoordinates(coords)) {
            errors.push(`Invalid coordinates for ${data.name || 'unknown service'}`);
            return;
          }

          const service = {
            name: data.name,
            type: data.type || 'other',
            category: data.category || 'emergency',
            description: data.description,
            contact: {
              phone: data.phone,
              email: data.email,
              website: data.website
            },
            location: {
              type: 'Point',
              coordinates: coords,
              address: {
                street: data.street,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                country: data.country || 'India',
                fullAddress: data.address
              }
            },
            operatingHours: {
              is24Hours: data.is24Hours === 'true',
              monday: {
                open: data.mondayOpen || '09:00',
                close: data.mondayClose || '17:00',
                isOpen: data.mondayIsOpen !== 'false'
              },
              // Add other days similarly
            },
            isActive: data.isActive !== 'false',
            addedBy: req.user._id
          };

          results.push(service);
        } catch (err) {
          errors.push(`Error processing record: ${err.message}`);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  if (errors.length > 0) {
    fs.unlinkSync(req.file.path);
    throw createValidationError('csv', `Found ${errors.length} errors in CSV`, { details: errors });
  }

  const services = await EmergencyService.insertMany(results);
  fs.unlinkSync(req.file.path);

  res.status(201).json({
    success: true,
    message: `Successfully imported ${services.length} services`,
    data: { services }
  });
}));

// Other CRUD operations remain unchanged
// ...

module.exports = router;