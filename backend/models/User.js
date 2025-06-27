const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number']
    },
    relationship: {
      type: String,
      enum: ['family', 'friend', 'colleague', 'other'],
      default: 'family'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    searchRadius: {
      type: Number,
      default: 10, // in kilometers
      min: 1,
      max: 50
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
userSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d' 
    }
  );
};

// Method to update current location
userSchema.methods.updateLocation = function(lat, lng, address = '') {
  this.currentLocation = {
    type: 'Point',
    coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
    address,
    lastUpdated: new Date()
  };
  return this.save();
};

// Method to add emergency contact
userSchema.methods.addEmergencyContact = function(contact) {
  // If this is the first contact or marked as primary, set isPrimary to true
  if (this.emergencyContacts.length === 0 || contact.isPrimary) {
    this.emergencyContacts.forEach(c => c.isPrimary = false);
  }
  
  this.emergencyContacts.push(contact);
  return this.save();
};

// Method to remove emergency contact
userSchema.methods.removeEmergencyContact = function(contactId) {
  this.emergencyContacts = this.emergencyContacts.filter(
    contact => contact._id.toString() !== contactId.toString()
  );
  return this.save();
};

// Static method to find users by location
userSchema.statics.findNearby = function(coordinates, maxDistance = 10) {
  return this.find({
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

module.exports = mongoose.model('User', userSchema); 