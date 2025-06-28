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

// Method to calculate distance from a point
emergencyServiceSchema.methods.calculateDistance = function(lat, lng) {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = this.location.coordinates[1];
  const lon1 = this.location.coordinates[0];
  const lat2 = lat;
  const lon2 = lng;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  this._distance = distance;
  return distance;
};

// Static method to find services near a location
emergencyServiceSchema.statics.findNearby = function(lat, lng, maxDistance = 10, type = null) {
  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance * 1000 // Convert to meters
      }
    },
    isActive: true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('addedBy', 'name email')
    .sort({ 'location.coordinates': 1 });
};

// Static method to find services by type and location
emergencyServiceSchema.statics.findByTypeAndLocation = function(type, lat, lng, maxDistance = 10) {
  return this.findNearby(lat, lng, maxDistance, type);
};

// Pre-save middleware to update lastUpdated
emergencyServiceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to update capacity
emergencyServiceSchema.methods.updateCapacity = function(capacityData) {
  this.capacity = { ...this.capacity, ...capacityData };
  return this.save();
};

// Method to add service
emergencyServiceSchema.methods.addService = function(serviceData) {
  this.services.push(serviceData);
  return this.save();
};

// Method to update rating
emergencyServiceSchema.methods.updateRating = function(newRating) {
  const totalRating = this.ratings.average * this.ratings.count + newRating;
  this.ratings.count += 1;
  this.ratings.average = totalRating / this.ratings.count;
  return this.save();
};

module.exports = mongoose.model('EmergencyService', emergencyServiceSchema);