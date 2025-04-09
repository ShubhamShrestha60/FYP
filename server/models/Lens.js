const mongoose = require('mongoose');

const lensSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Lens type is required'],
    enum: {
      values: ['Single Vision', 'Bifocal', 'Progressive'],
      message: 'Invalid lens type'
    }
  },
  coating: {
    type: String,
    required: [true, 'Coating type is required'],
    enum: {
      values: ['Normal', 'Blue Ray Cut', 'Combo'],
      message: 'Invalid coating type'
    }
  },
  // Single Vision specific fields
  singleVisionBasePrice: {
    type: Number,
    required: function() {
      return this.type === 'Single Vision';
    },
    min: [0, 'Price cannot be negative']
  },
  singleVisionIncreasedPrice: {
    type: Number,
    required: function() {
      return this.type === 'Single Vision';
    },
    min: [0, 'Price cannot be negative']
  },
  // Bifocal specific fields
  bifocalBasePrice: {
    type: Number,
    required: function() {
      return this.type === 'Bifocal';
    },
    min: [0, 'Price cannot be negative']
  },
  bifocalIncreasedPrice: {
    type: Number,
    required: function() {
      return this.type === 'Bifocal';
    },
    min: [0, 'Price cannot be negative']
  },
  // Progressive specific fields
  progressiveBasePrice: {
    type: Number,
    required: function() {
      return this.type === 'Progressive';
    },
    min: [0, 'Price cannot be negative']
  },
  progressiveIncreasedPrice: {
    type: Number,
    required: function() {
      return this.type === 'Progressive';
    },
    min: [0, 'Price cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
lensSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add a method to get the appropriate price based on prescription
lensSchema.methods.getPrice = function(sphere, nearDistance) {
  switch (this.type) {
    case 'Single Vision':
      return sphere < -6 ? this.singleVisionIncreasedPrice : this.singleVisionBasePrice;
    case 'Bifocal':
      return nearDistance > 6 ? this.bifocalIncreasedPrice : this.bifocalBasePrice;
    case 'Progressive':
      return nearDistance > 6 ? this.progressiveIncreasedPrice : this.progressiveBasePrice;
    default:
      return 0;
  }
};

module.exports = mongoose.model('Lens', lensSchema);