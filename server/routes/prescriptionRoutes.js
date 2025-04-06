const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { auth, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const cloudinaryStorage = require('../middleware/cloudinaryStorage');
const mongoose = require('mongoose');

// Define validation function before creating router
function validateEyeData(eyeData, eyeName) {
  if (!eyeData || typeof eyeData !== 'object') {
    throw new Error(`Invalid ${eyeName} data`);
  }

  const { sphere, cylinder, axis, pd } = eyeData;

  if (sphere === undefined || cylinder === undefined || 
      axis === undefined || pd === undefined) {
    throw new Error(`Missing required fields for ${eyeName}`);
  }

  // Convert to numbers and validate
  const numSphere = Number(sphere);
  const numCylinder = Number(cylinder);
  const numAxis = Number(axis);
  const numPd = Number(pd);

  if (isNaN(numSphere) || isNaN(numCylinder) || 
      isNaN(numAxis) || isNaN(numPd)) {
    throw new Error(`Invalid numeric values for ${eyeName}`);
  }

  // Validate ranges
  if (numSphere < -20 || numSphere > 20) {
    throw new Error(`Invalid sphere value for ${eyeName}`);
  }
  if (numCylinder < -6 || numCylinder > 6) {
    throw new Error(`Invalid cylinder value for ${eyeName}`);
  }
  if (numAxis < 0 || numAxis > 180) {
    throw new Error(`Invalid axis value for ${eyeName}`);
  }
  if (numPd < 25 || numPd > 40) {
    throw new Error(`Invalid PD value for ${eyeName}`);
  }
}

// Create new prescription
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating prescription:', req.body);
    
    // Validate eye data
    validateEyeData(req.body.rightEye, 'Right Eye');
    validateEyeData(req.body.leftEye, 'Left Eye');

    // Create base prescription data
    const prescriptionData = {
      userId: req.user.id,
      rightEye: {
        sphere: Number(req.body.rightEye.sphere),
        cylinder: Number(req.body.rightEye.cylinder),
        axis: Number(req.body.rightEye.axis),
        pd: Number(req.body.rightEye.pd)
      },
      leftEye: {
        sphere: Number(req.body.leftEye.sphere),
        cylinder: Number(req.body.leftEye.cylinder),
        axis: Number(req.body.leftEye.axis),
        pd: Number(req.body.leftEye.pd)
      },
      prescriptionType: req.body.prescriptionType,
      usage: req.body.usage,
      prescriptionDate: req.body.prescriptionDate,
      prescriptionImage: req.body.prescriptionImage
    };

    // Handle addition for Bifocal and Progressive
    if (['Bifocal', 'Progressive'].includes(req.body.prescriptionType)) {
      if (!req.body.addition) {
        return res.status(400).json({
          success: false,
          message: 'Addition power is required for Bifocal and Progressive lenses'
        });
      }
      prescriptionData.addition = Number(req.body.addition);
    }

    console.log('Processed prescription data:', prescriptionData);

    const prescription = new Prescription(prescriptionData);
    const savedPrescription = await prescription.save();
    
    console.log('Saved prescription:', savedPrescription);
    res.status(201).json({
      success: true,
      prescription: savedPrescription
    });
  } catch (error) {
    console.error('Error saving prescription:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error saving prescription',
      error: error.message
    });
  }
});

// Upload prescription image
router.post('/upload', auth, cloudinaryStorage.single('prescriptionImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ 
      success: true,
      imageUrl: req.file.path
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get user's prescriptions
// Get user's prescriptions with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, prescriptionType } = req.query;
    const filters = { userId: req.user.id };

    // Add filters if provided
    if (status) filters.status = status;
    if (prescriptionType) filters.prescriptionType = prescriptionType;

    console.log('Applying filters:', filters); // Debug log

    const prescriptions = await Prescription.find(filters)
      .sort({ prescriptionDate: -1 });

    console.log('Found prescriptions:', prescriptions); // Debug log
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all prescriptions (admin only)
router.get('/admin', isAdmin, async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update prescription verification status
router.patch('/:id/verify', isAdmin, async (req, res) => {
  try {
    const { status, verificationNotes } = req.body;
    
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    prescription.status = status;
    prescription.verificationNotes = verificationNotes;
    prescription.verifiedBy = req.user.id;
    await prescription.save();

    const updatedPrescription = await prescription.populate('userId', 'name email');
    res.json(updatedPrescription);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error updating prescription status' });
  }
});

// Remove prescription
router.delete('/:id', auth, async (req, res) => {
  try {
    // Log the incoming request
    console.log('Remove request received for prescription:', req.params.id);
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prescription ID'
      });
    }

    // Find the prescription and ensure it belongs to the user
    const prescription = await Prescription.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });

    if (!prescription) {
      return res.status(404).json({ 
        success: false,
        message: 'Prescription not found or unauthorized' 
      });
    }

    if (prescription.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove verified prescriptions'
      });
    }

    // Remove the prescription from the database
    const result = await Prescription.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Prescription could not be removed'
      });
    }

    res.json({ 
      success: true,
      message: 'Prescription removed successfully' 
    });
  } catch (error) {
    console.error('Remove operation failed:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing prescription',
      error: error.message 
    });
  }
});

// Add this new route for fetching verified prescriptions by type
// Add this new route after your existing routes
// Get verified prescriptions by type for the current user
// Move this route BEFORE the generic '/' route
router.get('/user/verified/:type', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;

    console.log('Fetching verified prescriptions:', {
      userId,
      type,
      status: 'verified'
    });

    const prescriptions = await Prescription.find({
      userId: userId,
      prescriptionType: type,
      status: 'verified'
    }).sort({ prescriptionDate: -1 });

    console.log('Found prescriptions:', prescriptions);
    res.json(prescriptions);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Error fetching prescriptions',
      error: error.message 
    });
  }
});

// Move this generic route AFTER the specific routes
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching prescriptions for user:', req.user.id);
    const prescriptions = await Prescription.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;