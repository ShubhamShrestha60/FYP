const mongoose = require('mongoose');

// Status transition rules
const statusTransitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['cancelled'], // Only allow cancellation if within return window
  cancelled: [] // No transitions allowed after cancellation
};

// Status change requirements
const statusRequirements = {
  shipped: {
    required: ['trackingNumber', 'carrier'],
    optional: ['estimatedDelivery', 'notes']
  },
  cancelled: {
    required: ['reason'],
    optional: ['notes']
  },
  processing: {
    required: [],
    optional: ['notes', 'estimatedDelivery']
  },
  delivered: {
    required: [],
    optional: ['notes']
  }
};

const orderSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: [true, 'Customer name is required'] },
    email: { 
      type: String, 
      required: [true, 'Customer email is required'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: { 
      type: String, 
      required: [true, 'Customer phone is required'],
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    }
  },
  shippingAddress: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    postalCode: { 
      type: String,
      default: ''
    },
    country: { type: String, required: [true, 'Country is required'] }
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: [true, 'Product reference is required'] 
    },
    quantity: { 
      type: Number, 
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    lensOptions: {
      type: {
        type: String,
        enum: ['Single Vision', 'Bifocal', 'Progressive', null],
        default: null
      },
      coating: {
        type: String,
        enum: ['Normal', 'Blue Ray Cut', 'Combo', null],
        default: null
      },
      prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
        default: null
      },
      price: {
        type: Number,
        default: 0
      }
    }
  }],
  subtotal: { 
    type: Number, 
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  shippingCost: { 
    type: Number, 
    default: 0
  },
  total: { 
    type: Number, 
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String,
    metadata: {
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date,
      notes: String
    }
  }],
  paymentMethod: {
    type: String,
    enum: ['cod', 'esewa', 'khalti'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add methods to schema before creating model
orderSchema.methods.canTransitionTo = function(newStatus) {
  return statusTransitions[this.status].includes(newStatus);
};

orderSchema.methods.validateStatusChange = function(newStatus, changeData) {
  const requirements = statusRequirements[newStatus];
  if (!requirements) return { valid: false, message: 'Invalid status' };

  const missingRequired = requirements.required.filter(field => !changeData[field]);
  if (missingRequired.length > 0) {
    return {
      valid: false,
      message: `Missing required fields for ${newStatus} status: ${missingRequired.join(', ')}`
    };
  }

  return { valid: true };
};

// Remove any existing model to avoid the OverwriteModelError
mongoose.models = {};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 