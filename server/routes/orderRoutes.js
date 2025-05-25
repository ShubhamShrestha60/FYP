const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, isAdmin } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../services/emailService');
const generateInvoicePdf = require('../utils/generateInvoicePdf');

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
    console.log('Fetching orders for email:', req.user.email);
    const orders = await Order.find({ 'customer.email': req.user.email })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate and serve invoice PDF for an order
router.get('/:orderId/invoice', async (req, res) => {
  const orderId = req.params.orderId;
  console.log('Invoice requested for orderId:', orderId);
  try {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      console.log('Order not found for orderId:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('Order found, generating PDF for orderId:', orderId);
    const pdfBuffer = await generateInvoicePdf(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice for orderId:', orderId, error);
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

// Cancel order (user only)
router.post('/:orderId/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, 'customer.email': req.user.email });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    if (!req.body.reason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    // Create status history entry
    const statusHistoryEntry = {
      status: 'cancelled',
      changedBy: req.user._id,
      reason: req.body.reason,
      metadata: {
        notes: 'Cancelled by customer'
      }
    };

    // Update order
    order.status = 'cancelled';
    order.statusHistory.push(statusHistoryEntry);
    await order.save();

    // Send cancellation email
    await sendOrderStatusEmail({
      to: order.customer.email,
      orderId: order._id,
      status: 'cancelled',
      customerName: order.customer.name,
      reason: req.body.reason
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Update order status (admin only)
router.patch('/admin/orders/:orderId/status', isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status, trackingNumber, carrier, estimatedDelivery, reason, notes } = req.body;

    // Validate status transition
    if (!order.canTransitionTo(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${order.status} to ${status}` 
      });
    }

    // Validate status change requirements
    const validation = order.validateStatusChange(status, {
      trackingNumber,
      carrier,
      estimatedDelivery,
      reason,
      notes
    });

    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    // Create status history entry
    const statusHistoryEntry = {
      status,
      changedBy: req.user._id,
      reason,
      metadata: {
        trackingNumber,
        carrier,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        notes
      }
    };

    // Update order
    order.status = status;
    if (status === 'shipped') {
      order.trackingNumber = trackingNumber;
      order.carrier = carrier;
    }
    order.statusHistory.push(statusHistoryEntry);
    await order.save();

    // Send status update email
    await sendOrderStatusEmail({
      to: order.customer.email,
      orderId: order._id,
      status,
      customerName: order.customer.name,
      trackingNumber,
      carrier,
      estimatedDelivery,
      reason,
      notes
    });

    res.json({ 
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Get order status history (admin only)
router.get('/admin/orders/:orderId/history', isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('statusHistory.changedBy', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ statusHistory: order.statusHistory });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Error fetching order history' });
  }
});

// Catch-all route for debugging
router.use('*', (req, res) => {
  console.log('Unmatched route accessed:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

module.exports = router; 