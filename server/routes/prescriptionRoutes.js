const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { auth } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log('Prescription Route accessed:', req.method, req.path);
  next();
});

// Create new prescription
router.post('/', auth, async (req, res) => {
  try {
    // Log everything for debugging
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
      prescriptionType: req.body.prescriptionType || 'Single Vision'
    };

    console.log('5. Processed data:', JSON.stringify(prescriptionData, null, 2));

    // Create and save prescription
    const prescription = new Prescription(prescriptionData);
    console.log('6. Created prescription object');

    const savedPrescription = await prescription.save();
    console.log('7. Saved successfully:', savedPrescription);

    res.status(201).json({
      success: true,
      prescription: savedPrescription
    });

  } catch (error) {
    console.error('ERROR DETAILS:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

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

module.exports = router; 