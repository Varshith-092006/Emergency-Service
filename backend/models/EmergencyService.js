const mongoose = require('mongoose');

const emergencyServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide a service type'],
    enum: ['hospital', 'police', 'ambulance', 'fire', 'pharmacy', 'veterinary', 'other'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a service category'],
    enum: ['emergency', 'urgent', 'routine'],
    default: 'emergency'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid website URL'
      ]
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide coordinates'],
      index: '2dsphere'
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      },
      fullAddress: String
    }
  },
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    friday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    sunday: {
      open: String,
      close: String,
      isOpen: {
        type: Boolean,
        default: true
      }
    },
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  services: [{
    name: String,
    description: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  capacity: {
    totalBeds: Number,
    availableBeds: Number,
    icuBeds: Number,
    availableIcuBeds: Number
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
emergencyServiceSchema.index({ 'location.coordinates': '2dsphere' });
emergencyServiceSchema.index({ type: 1, isActive: 1 });
emergencyServiceSchema.index({ 'location.address.city': 1, 'location.address.state': 1 });
emergencyServiceSchema.index({ tags: 1 });

// Virtual for distance calculation
emergencyServiceSchema.virtual('distance').get(function() {
  return this._distance;
});

// Virtual for current status
emergencyServiceSchema.virtual('isCurrentlyOpen').get(function() {
  if (this.operatingHours.is24Hours) return true;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Static method to find nearby services
emergencyServiceSchema.statics.findNearby = function(coordinates, options = {}) {
  const {
    maxDistance = 10,
    type = null,
    category = null,
    isActive = true,
    limit = 50
  } = options;

  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive
  };

  if (type) query.type = type;
  if (category) query.category = category;

  return this.find(query)
    .limit(limit)
    .populate('addedBy', 'name email')
    .lean();
};

// Static method to find services by location and type
emergencyServiceSchema.statics.findByLocationAndType = function(lat, lng, type, radius = 10) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000
      }
    },
    type,
    isActive: true
  }).populate('addedBy', 'name email');
};

// Static method to search services
emergencyServiceSchema.statics.searchServices = function(searchTerm, options = {}) {
  const {
    type = null,
    category = null,
    city = null,
    state = null,
    isActive = true,
    limit = 50
  } = options;

  const query = {
    $and: [
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { 'location.address.city': { $regex: searchTerm, $options: 'i' } },
          { 'location.address.state': { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      },
      { isActive }
    ]
  };

  if (type) query.$and.push({ type });
  if (category) query.$and.push({ category });
  if (city) query.$and.push({ 'location.address.city': { $regex: city, $options: 'i' } });
  if (state) query.$and.push({ 'location.address.state': { $regex: state, $options: 'i' } });

  return this.find(query)
    .limit(limit)
    .populate('addedBy', 'name email')
    .sort({ ratings: { average: -1 } });
};

// Method to update rating
emergencyServiceSchema.methods.updateRating = function(newRating) {
  const totalRating = this.ratings.average * this.ratings.count + newRating;
  this.ratings.count += 1;
  this.ratings.average = totalRating / this.ratings.count;
  return this.save();
};

// Method to check if service is open
emergencyServiceSchema.methods.checkIfOpen = function() {
  if (this.operatingHours.is24Hours) return true;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Method to get formatted address
emergencyServiceSchema.methods.getFormattedAddress = function() {
  const addr = this.location.address;
  const parts = [addr.street, addr.city, addr.state, addr.pincode, addr.country];
  return parts.filter(part => part).join(', ');
};

// Pre-save middleware to update lastUpdated
emergencyServiceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('EmergencyService', emergencyServiceSchema); 