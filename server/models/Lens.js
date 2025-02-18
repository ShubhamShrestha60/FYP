const mongoose = require('mongoose');

const lensSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Single Vision', 'Bifocal', 'Progressive', 'Computer'],
    required: true
  },
  material: {
    type: String,
    enum: ['CR39', 'Polycarbonate', 'High Index 1.67', 'High Index 1.74'],
    required: true
  },
  features: [{
    type: String,
    enum: ['Anti-Reflective', 'Blue Light', 'Photochromic', 'UV Protection', 'Scratch Resistant']
  }],
  powerRange: {
    min: Number,
    max: Number
  },
  basePrice: {
    type: Number,
    required: true
  },
  additionalFeaturesPrices: {
    antiReflective: Number,
    blueLight: Number,
    photochromic: Number
  },
  description: String,
  availability: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Lens', lensSchema); 