const mongoose = require('mongoose');

const lensSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Single Vision', 'Bifocal', 'Progressive'],
    required: true
  },
  coating: {
    type: String,
    enum: ['Normal', 'Blue Ray Cut', 'Combo'],
    required: true
  },
  powerRanges: {
    sphere: {
      range0to6: {
        type: Number,
        required: true
      },
      above6: {
        type: Number,
        required: true
      }
    },
    cylinder: {
      range0to2: {
        type: Number,
        required: true
      },
      above2: {
        type: Number,
        required: true
      }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Lens', lensSchema);