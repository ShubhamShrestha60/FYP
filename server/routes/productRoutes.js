const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products across all categories
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(query, 'i');

    // Search in name, brand, and description
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex }
      ]
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all unique brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    //added section for virtual try on images
    const product = new Product({
      ...req.body,
      virtualTryOnImages: req.body.virtualTryOnImages || []
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;

    // Validate required fields
    const requiredFields = ['name', 'brand', 'price', 'category', 'description', 'stock', 'images'];
    for (let field of requiredFields) {
      if (!updates[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Validate numeric fields
    if (isNaN(Number(updates.price)) || Number(updates.price) <= 0) {
      return res.status(400).json({ message: 'Invalid price' });
    }

    if (isNaN(Number(updates.stock)) || Number(updates.stock) < 0) {
      return res.status(400).json({ message: 'Invalid stock quantity' });
    }

    // Find and update the product
    const product = await Product.findByIdAndUpdate(
      productId,
      { 
        ...updates,
        //added section for virtual try on images
        virtualTryOnImages: updates.virtualTryOnImages || [],
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload images (admin only)
router.post('/upload', isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // For Cloudinary, the path property contains the full URL
    const imageUrls = req.files.map(file => file.path);
    console.log('Uploaded files to Cloudinary:', imageUrls);

    res.json({ imageUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category 
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 