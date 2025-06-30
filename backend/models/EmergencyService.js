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
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 !isNaN(coords[0]) && 
                 !isNaN(coords[1]) &&
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates provided'
      },
      index: '2dsphere'
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true,
        index: true
      },
      state: {
        type: String,
        required: true,
        index: true
      },
      pincode: String,
      country: {
        type: String,
        default: 'India'
      },
      fullAddress: String
    }
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean },
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  services: [{
    name: String,
    description: String,
    isAvailable: Boolean
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
    isPrimary: Boolean
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
  lastUpdated: Date,
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
emergencyServiceSchema.index({ 'location.coordinates': '2dsphere' });
emergencyServiceSchema.index({ type: 1, category: 1, isActive: 1 });
emergencyServiceSchema.index({ name: 'text', description: 'text' });
emergencyServiceSchema.index({ 'location.address.city': 1, 'location.address.state': 1 });

// Virtuals
emergencyServiceSchema.virtual('distance').get(function() {
  return this._distance;
});

emergencyServiceSchema.virtual('isOpenNow').get(function() {
  if (this.operatingHours?.is24Hours) return true;
  
  const now = new Date();
  const day = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().substring(0, 5);
  
  const hours = this.operatingHours?.[day];
  return hours?.isOpen && currentTime >= hours.open && currentTime <= hours.close;
});

// Static Methods
emergencyServiceSchema.statics.findNearby = async function(coordinates, options = {}) {
  const query = {
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: options.maxDistance * 1000
      }
    },
    isActive: true
  };

  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;

  let services = await this.find(query)
    .select('name type category contact location operatingHours ratings isActive')
    .limit(options.limit)
    .maxTimeMS(30000)
    .populate('addedBy', 'name email')
    .lean();

  if (options.isOpenNow) {
    const now = new Date();
    const day = now.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().substring(0, 5);
    
    services = services.filter(service => {
      if (service.operatingHours?.is24Hours) return true;
      const hours = service.operatingHours?.[day];
      return hours?.isOpen && currentTime >= hours.open && currentTime <= hours.close;
    });
  }

  return services;
};

// Methods
emergencyServiceSchema.methods.updateRating = async function(newRating) {
  this.ratings.average = ((this.ratings.average * this.ratings.count) + newRating) / (this.ratings.count + 1);
  this.ratings.count += 1;
  return this.save();
};

// Hooks
emergencyServiceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Ensure coordinates are in [longitude, latitude] order
  if (this.location.coordinates && this.location.coordinates.length === 2) {
    this.location.coordinates = [
      parseFloat(this.location.coordinates[0]),
      parseFloat(this.location.coordinates[1])
    ];
  }
  
  next();
});

module.exports = mongoose.model('EmergencyService', emergencyServiceSchema);