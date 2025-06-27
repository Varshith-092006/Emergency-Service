const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
      required: [true, 'Location coordinates are required'],
      index: '2dsphere'
    },
    address: String,
    accuracy: Number
  },
  emergencyType: {
    type: String,
    enum: ['medical', 'police', 'fire', 'accident', 'other'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responding', 'resolved', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  contactedServices: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyService'
    },
    contactedAt: {
      type: Date,
      default: Date.now
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'unavailable'],
      default: 'pending'
    },
    estimatedArrival: Date,
    notes: String
  }],
  notifications: {
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [String],
      message: String
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [String],
      subject: String,
      message: String
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [String]
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  resolutionNotes: String,
  estimatedResponseTime: Number, // in minutes
  actualResponseTime: Number, // in minutes
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
sosSchema.index({ 'location.coordinates': '2dsphere' });
sosSchema.index({ status: 1, createdAt: -1 });
sosSchema.index({ user: 1, createdAt: -1 });
sosSchema.index({ emergencyType: 1, status: 1 });

// Virtual for response time calculation
sosSchema.virtual('responseTime').get(function() {
  if (this.status === 'resolved' && this.resolvedAt) {
    return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60)); // minutes
  }
  return null;
});

// Virtual for time since creation
sosSchema.virtual('timeSinceCreation').get(function() {
  return Math.round((Date.now() - this.createdAt) / (1000 * 60)); // minutes
});

// Static method to find nearby SOS alerts
sosSchema.statics.findNearby = function(coordinates, maxDistance = 5) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    status: { $in: ['pending', 'acknowledged', 'responding'] },
    isActive: true
  }).populate('user', 'name phone email');
};

// Static method to find active SOS alerts
sosSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['pending', 'acknowledged', 'responding'] },
    isActive: true
  })
  .populate('user', 'name phone email')
  .populate('contactedServices.service', 'name type contact')
  .sort({ createdAt: -1 });
};

// Static method to find SOS alerts by user
sosSchema.statics.findByUser = function(userId, limit = 20) {
  return this.find({ user: userId })
    .populate('contactedServices.service', 'name type contact')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to update status
sosSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
    this.resolutionNotes = notes;
  }
  
  return this.save();
};

// Method to add contacted service
sosSchema.methods.addContactedService = function(serviceId, response = 'pending', estimatedArrival = null, notes = '') {
  this.contactedServices.push({
    service: serviceId,
    response,
    estimatedArrival,
    notes
  });
  
  return this.save();
};

// Method to update service response
sosSchema.methods.updateServiceResponse = function(serviceId, response, estimatedArrival = null, notes = '') {
  const service = this.contactedServices.find(s => s.service.toString() === serviceId.toString());
  if (service) {
    service.response = response;
    service.estimatedArrival = estimatedArrival;
    service.notes = notes;
    return this.save();
  }
  throw new Error('Service not found in contacted services');
};

// Method to mark notification as sent
sosSchema.methods.markNotificationSent = function(type, recipients, message = '') {
  if (type === 'sms') {
    this.notifications.sms.sent = true;
    this.notifications.sms.sentAt = new Date();
    this.notifications.sms.recipients = recipients;
    this.notifications.sms.message = message;
  } else if (type === 'email') {
    this.notifications.email.sent = true;
    this.notifications.email.sentAt = new Date();
    this.notifications.email.recipients = recipients;
    this.notifications.email.message = message;
  } else if (type === 'push') {
    this.notifications.push.sent = true;
    this.notifications.push.sentAt = new Date();
    this.notifications.push.recipients = recipients;
  }
  
  return this.save();
};

// Method to calculate response time
sosSchema.methods.calculateResponseTime = function() {
  if (this.status === 'resolved' && this.resolvedAt) {
    this.actualResponseTime = Math.round((this.resolvedAt - this.createdAt) / (1000 * 60));
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware to update timestamps
sosSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('SOS', sosSchema); 