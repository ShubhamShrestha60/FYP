const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rightEye: {
    sphere: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= -20 && v <= 20;  // Standard range for sphere
        },
        message: 'Sphere must be between -20 and +20'
      }
    },
    cylinder: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= -6 && v <= 6;  // Standard range for cylinder
        },
        message: 'Cylinder must be between -6 and +6'
      }
    },
    axis: {
      type: Number,
      required: true,
      min: 0,
      max: 180,
      validate: {
        validator: Number.isInteger,
        message: 'Axis must be an integer between 0 and 180'
      }
    }
  },
  leftEye: {
    sphere: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= -20 && v <= 20;  // Standard range for sphere
        },
        message: 'Sphere must be between -20 and +20'
      }
    },
    cylinder: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
          return v >= -6 && v <= 6;  // Standard range for cylinder
        },
        message: 'Cylinder must be between -6 and +6'
      }
    },
    axis: {
      type: Number,
      required: true,
      min: 0,
      max: 180,
      validate: {
        validator: Number.isInteger,
        message: 'Axis must be an integer between 0 and 180'
      }
    }
  },
  prescriptionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true,
    default: function() {
      let date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
  },
  prescriptionImage: {
    type: String,  // URL to stored image
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationNotes: {
    type: String
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pdDistance: {
    type: Number,
    required: true,
    min: 50,
    max: 80
  },
  prescriptionType: {
    type: String,
    enum: ['Single Vision', 'Bifocal', 'Progressive'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema); 