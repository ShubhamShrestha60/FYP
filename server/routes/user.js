const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Add to favorites
router.post('/favorites/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product is already in favorites
    if (user.favorites.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in favorites' });
    }

    user.favorites.push(req.params.productId);
    await user.save();

    res.json({ message: 'Product added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/favorites/:productId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = user.favorites.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({ message: 'Product removed from favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's favorites
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 