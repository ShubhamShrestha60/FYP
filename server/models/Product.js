const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['sunglasses', 'eyeglasses', 'contactlens'],
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  //added section for virtual try on images
  virtualTryOnImages: [{
    type: String,
    required: false
  }],
  specifications: {
    frameSize: String,
    frameWidth: String,
    material: String,
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'],
      default: 'unisex'
    },
    frameColor: String,
    frameShape: String
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
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema); 