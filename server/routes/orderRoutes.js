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
    const order = new Order(req.body);
    const savedOrder = await order.save();
    console.log('Saved order:', savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', isAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 