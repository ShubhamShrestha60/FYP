const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  rightEye: {
    sphere: { 
      type: Number, 
      required: true,
      min: -20,
      max: 20
    },
    cylinder: { 
      type: Number, 
      required: true,
      min: -6,
      max: 6
    },
    axis: { 
      type: Number, 
      required: true,
      min: 0,
      max: 180
    },
    pd: { 
      type: Number, 
      required: true,
      min: 25,
      max: 40
    }
  },
  leftEye: {
    sphere: { 
      type: Number, 
      required: true,
      min: -20,
      max: 20
    },
    cylinder: { 
      type: Number, 
      required: true,
      min: -6,
      max: 6
    },
    axis: { 
      type: Number, 
      required: true,
      min: 0,
      max: 180
    },
    pd: { 
      type: Number, 
      required: true,
      min: 25,
      max: 40
    }
  },
  prescriptionType: {
    type: String,
    required: true,
    enum: ['Single Vision', 'Bifocal', 'Progressive']
  },
  usage: {
    type: String,
    required: true,
    enum: ['Distance', 'Reading', 'Computer', 'All Purpose']
  },
  addition: {
    type: Number,
    min: 0.75,
    max: 4.00,
    required: function() {
      return ['Bifocal', 'Progressive'].includes(this.prescriptionType);
    },
    validate: {
      validator: function(v) {
        if (!this.prescriptionType || ['Bifocal', 'Progressive'].includes(this.prescriptionType)) {
          return v >= 0.75 && v <= 4.00;
        }
        return true;
      },
      message: 'Addition must be between 0.75 and 4.00 for Bifocal and Progressive lenses'
    }
  },
  prescriptionDate: {
    type: Date,
    required: true
  },
  prescriptionImage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationNotes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);