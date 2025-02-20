const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get admin dashboard stats
router.get('/stats', isAdmin, async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    // Get product count
    const productCount = await Product.countDocuments();
    console.log('Product count:', productCount);

    // Get user count
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);

    // Get order count and revenue
    const orderCount = await Order.countDocuments();
    console.log('Order count:', orderCount);

    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    console.log('Revenue:', revenue);

    const stats = {
      products: productCount,
      orders: orderCount,
      users: userCount,
      revenue: revenue[0]?.total || 0
    };

    console.log('Sending stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add other admin routes here
router.get('/test', isAdmin, (req, res) => {
  res.json({ message: 'Admin route working' });
});

module.exports = router; 