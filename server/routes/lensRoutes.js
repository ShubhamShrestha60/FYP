const express = require('express');
const router = express.Router();
const Lens = require('../models/Lens');
const { isAdmin, auth } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log('Lens Route accessed:', req.method, req.path);
    next();
});

// Get all lens configurations with optional filters
router.get('/', async (req, res) => {
    try {
        console.log('Fetching lens configurations with filters:', req.query);
        const { type, coating } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (coating) filter.coating = coating;

        const lensTypes = await Lens.find(filter).sort({ type: 1, coating: 1 });
        console.log(`Found ${lensTypes.length} lens configurations`);
        
        res.json({
            success: true,
            count: lensTypes.length,
            data: lensTypes
        });
    } catch (error) {
        console.error('Error fetching lens configurations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lens configurations',
            error: error.message
        });
    }
});

// Get single lens configuration by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching lens configuration:', req.params.id);
        const lens = await Lens.findById(req.params.id);
        
        if (!lens) {
            return res.status(404).json({
                success: false,
                message: 'Lens configuration not found'
            });
        }

        res.json({
            success: true,
            data: lens
        });
    } catch (error) {
        console.error('Error fetching lens configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lens configuration',
            error: error.message
        });
    }
});

// Add new lens configuration (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        console.log('Creating new lens configuration:', req.body);
        
        // Validate required fields
        const requiredFields = ['type', 'coating', 'powerRanges'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate power ranges
        const { powerRanges } = req.body;
        if (!powerRanges.sphere || !powerRanges.cylinder) {
            return res.status(400).json({
                success: false,
                message: 'Power ranges must include both sphere and cylinder values'
            });
        }

        // Validate numeric values
        const sphereRanges = ['range0to6', 'above6'];
        const cylinderRanges = ['range0to2', 'above2'];

        for (const range of sphereRanges) {
            if (typeof powerRanges.sphere[range] !== 'number' || powerRanges.sphere[range] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid sphere ${range} value`
                });
            }
        }

        for (const range of cylinderRanges) {
            if (typeof powerRanges.cylinder[range] !== 'number' || powerRanges.cylinder[range] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid cylinder ${range} value`
                });
            }
        }

        // Check if a lens configuration with same type and coating already exists
        const existingLens = await Lens.findOne({
            type: req.body.type,
            coating: req.body.coating
        });

        if (existingLens) {
            return res.status(400).json({
                success: false,
                message: 'A lens configuration with this type and coating already exists'
            });
        }

        const newLens = new Lens(req.body);
        const savedLens = await newLens.save();
        
        console.log('Created lens configuration:', savedLens);
        res.status(201).json({
            success: true,
            message: 'Lens configuration created successfully',
            data: savedLens
        });
    } catch (error) {
        console.error('Error creating lens configuration:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating lens configuration',
            error: error.message
        });
    }
});

// Update lens configuration (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        console.log('Updating lens configuration:', req.params.id);
        
        // Validate required fields
        const requiredFields = ['type', 'coating', 'powerRanges'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate power ranges
        const { powerRanges } = req.body;
        if (!powerRanges.sphere || !powerRanges.cylinder) {
            return res.status(400).json({
                success: false,
                message: 'Power ranges must include both sphere and cylinder values'
            });
        }

        // Validate numeric values
        const sphereRanges = ['range0to6', 'above6'];
        const cylinderRanges = ['range0to2', 'above2'];

        for (const range of sphereRanges) {
            if (typeof powerRanges.sphere[range] !== 'number' || powerRanges.sphere[range] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid sphere ${range} value`
                });
            }
        }

        for (const range of cylinderRanges) {
            if (typeof powerRanges.cylinder[range] !== 'number' || powerRanges.cylinder[range] < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid cylinder ${range} value`
                });
            }
        }

        // Check for duplicate configuration
        const existingLens = await Lens.findOne({
            _id: { $ne: req.params.id },
            type: req.body.type,
            coating: req.body.coating
        });

        if (existingLens) {
            return res.status(400).json({
                success: false,
                message: 'A lens configuration with this type and coating already exists'
            });
        }

        const updatedLens = await Lens.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedLens) {
            return res.status(404).json({
                success: false,
                message: 'Lens configuration not found'
            });
        }

        console.log('Updated lens configuration:', updatedLens);
        res.json({
            success: true,
            message: 'Lens configuration updated successfully',
            data: updatedLens
        });
    } catch (error) {
        console.error('Error updating lens configuration:', error);
        res.status(400).json({
            success: false,
            message: 'Error updating lens configuration',
            error: error.message
        });
    }
});

// Delete lens configuration (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        console.log('Deleting lens configuration:', req.params.id);
        const deletedLens = await Lens.findByIdAndDelete(req.params.id);

        if (!deletedLens) {
            return res.status(404).json({
                success: false,
                message: 'Lens configuration not found'
            });
        }

        console.log('Deleted lens configuration:', deletedLens);
        res.json({
            success: true,
            message: 'Lens configuration deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lens configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting lens configuration',
            error: error.message
        });
    }
});

module.exports = router;