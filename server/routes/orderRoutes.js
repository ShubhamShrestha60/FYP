const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log('Order Route accessed:', req.method, req.path);
  next();
});

// Create new order (public route)
router.post('/', async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    // Validate required fields
    if (!req.body.customer || !req.body.shippingAddress || !req.body.items || !req.body.paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate totals if not provided
    if (!req.body.subtotal || !req.body.total) {
      const subtotal = req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      req.body.subtotal = subtotal;
      req.body.shippingCost = 0; // Free shipping
      req.body.total = subtotal; // Total is same as subtotal
    }

    const order = new Order(req.body);
    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders (authenticated)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.email': req.user.email })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order (authenticated)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.customer.email !== req.user.email && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes
router.use('/admin', isAdmin);

// Get all orders (admin only)
router.get('/admin/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    
    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/admin/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 