const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const cloudinaryStorage = require('../middleware/cloudinaryStorage');

// Debug middleware
router.use((req, res, next) => {
  console.log('Prescription Route accessed:', req.method, req.path);
  next();
});

// Create new prescription
router.post('/', auth, async (req, res) => {
  try {
    console.log('1. Request received');
    console.log('2. Auth user:', req.user);
    console.log('3. Request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!req.body.rightEye || !req.body.leftEye || !req.body.pdDistance) {
      console.log('4. Validation failed - missing fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create prescription data with explicit type conversion
    const prescriptionData = {
      userId: req.user.id,
      rightEye: {
        sphere: Number(req.body.rightEye.sphere) || 0,
        cylinder: Number(req.body.rightEye.cylinder) || 0,
        axis: Number(req.body.rightEye.axis) || 0
      },
      leftEye: {
        sphere: Number(req.body.leftEye.sphere) || 0,
        cylinder: Number(req.body.leftEye.cylinder) || 0,
        axis: Number(req.body.leftEye.axis) || 0
      },
      pdDistance: Number(req.body.pdDistance) || 0,
      prescriptionType: req.body.prescriptionType || 'Single Vision',
      prescriptionImage: req.body.prescriptionImage
    };

    console.log('5. Processed data:', JSON.stringify(prescriptionData, null, 2));

    const prescription = new Prescription(prescriptionData);
    const savedPrescription = await prescription.save();

    res.status(201).json({
      success: true,
      prescription: savedPrescription
    });
  } catch (error) {
    console.error('ERROR DETAILS:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving prescription',
      error: error.message
    });
  }
});

// Get user's prescriptions
router.get('/', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add new routes
const cloudinaryUpload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload prescription image
router.post('/upload', auth, cloudinaryStorage.single('prescriptionImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('Uploaded file:', req.file);
    res.json({ 
      success: true,
      imageUrl: req.file.path // Cloudinary URL
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

router.get('/admin', isAdmin, async (req, res) => {
  try {
    console.log('Admin fetching prescriptions');
    const prescriptions = await Prescription.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('Found prescriptions:', prescriptions.length);
    
    if (prescriptions.length === 0) {
      return res.json([]);
    }

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.patch('/:id/verify', isAdmin, async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;
    
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verificationNotes,
        verifiedBy: req.user.id
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error updating prescription status' });
  }
});

module.exports = router; 