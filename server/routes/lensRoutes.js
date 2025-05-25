const express = require('express');
const router = express.Router();
const Lens = require('../models/Lens');
const { isAdmin } = require('../middleware/auth');

// Calculate prices for multiple coating types
router.post('/calculate-prices', async (req, res) => {
    try {
        const { prescriptionType, maxSphere, addition } = req.body;
        
        // Find all lens configurations for this prescription type
        const lenses = await Lens.find({ type: prescriptionType });
        
        if (!lenses || lenses.length === 0) {
            return res.status(404).json({ message: 'No lens configurations found' });
        }

        // Calculate prices for each coating
        const prices = {
            normal: null,
            blue_ray_cut: null,
            combo: null
        };

        lenses.forEach(lens => {
            let price;
            if (prescriptionType === 'Single Vision') {
                price = maxSphere > 6 ? lens.singleVisionIncreasedPrice : lens.singleVisionBasePrice;
            } else if (prescriptionType === 'Bifocal') {
                price = addition > 3 ? lens.bifocalIncreasedPrice : lens.bifocalBasePrice;
            } else {
                price = addition > 3 ? lens.progressiveIncreasedPrice : lens.progressiveBasePrice;
            }

            const key = lens.coating.toLowerCase().replace(/ /g, '_');
            prices[key] = price;
        });

        res.json(prices);
    } catch (error) {
        console.error('Error calculating prices:', error);
        res.status(500).json({ message: 'Failed to calculate prices' });
    }
});

// Get all lens configurations
router.get('/', async (req, res) => {
    try {
        const lenses = await Lens.find().sort({ type: 1, coating: 1 });
        res.json(lenses);
    } catch (error) {
        console.error('Error fetching lenses:', error);
        res.status(500).json({ message: 'Failed to fetch lens configurations' });
    }
});

// Get lens price based on prescription
router.get('/price', async (req, res) => {
    try {
        const { type, coating, sph, cyl, near } = req.query;
        
        // Validate required fields
        if (!type || !coating || sph === undefined) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        // Convert to numbers, default cylinder to 0 if not provided
        const sphere = parseFloat(sph);
        const cylinder = cyl === undefined ? 0 : parseFloat(cyl);
        const nearDistance = near === undefined ? 0 : parseFloat(near);

        // Validate numbers
        if (isNaN(sphere) || isNaN(cylinder) || isNaN(nearDistance)) {
            return res.status(400).json({ message: 'Invalid number format for sphere, cylinder, or near distance' });
        }

        // Find the lens configuration
        const lens = await Lens.findOne({ type, coating });
        if (!lens) {
            return res.status(404).json({ message: 'Lens configuration not found' });
        }

        // Validate prescription ranges based on lens type
        if (type === 'Single Vision') {
            if (sphere < -8 || sphere > 0) {
                return res.status(400).json({ 
                    message: 'Sphere power out of range',
                    validRange: '0 to -8.00'
                });
            }
            if (cylinder < -2 || cylinder > 0) {
                return res.status(400).json({ 
                    message: 'Cylinder power out of range',
                    validRange: '0 to -2.00'
                });
            }
        } else if (type === 'Bifocal' || type === 'Progressive') {
            if (sphere < -6 || sphere > 0) {
                return res.status(400).json({ 
                    message: 'Sphere power out of range',
                    validRange: '0 to -6.00'
                });
            }
            if (cylinder < -2 || cylinder > 0) {
                return res.status(400).json({ 
                    message: 'Cylinder power out of range',
                    validRange: '0 to -2.00'
                });
            }
            if (nearDistance < 0) {
                return res.status(400).json({ 
                    message: 'Near distance out of range',
                    validRange: '0 to +6.00'
                });
            }
        }

        // Get price using the model method
        const price = lens.getPrice(sphere, nearDistance);

        res.json({
            type,
            coating,
            sphere,
            cylinder,
            nearDistance,
            price,
            priceType: sphere < -6 || nearDistance > 6 ? 'increased' : 'base'
        });
    } catch (error) {
        console.error('Error getting lens price:', error);
        res.status(500).json({ message: 'Failed to get lens price' });
    }
});

// Add new lens configuration (admin only)
router.post('/', isAdmin, async (req, res) => {
    try {
        const { type, coating } = req.body;
        
        // Validate required fields
        if (!type || !coating) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Get the appropriate price fields based on lens type
        let priceFields = {};
        switch (type) {
            case 'Single Vision':
                if (!req.body.singleVisionBasePrice || !req.body.singleVisionIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Single Vision lenses' });
                }
                priceFields = {
                    singleVisionBasePrice: Math.round(parseFloat(req.body.singleVisionBasePrice)),
                    singleVisionIncreasedPrice: Math.round(parseFloat(req.body.singleVisionIncreasedPrice))
                };
                break;
            case 'Bifocal':
                if (!req.body.bifocalBasePrice || !req.body.bifocalIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Bifocal lenses' });
                }
                priceFields = {
                    bifocalBasePrice: Math.round(parseFloat(req.body.bifocalBasePrice)),
                    bifocalIncreasedPrice: Math.round(parseFloat(req.body.bifocalIncreasedPrice))
                };
                break;
            case 'Progressive':
                if (!req.body.progressiveBasePrice || !req.body.progressiveIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Progressive lenses' });
                }
                priceFields = {
                    progressiveBasePrice: Math.round(parseFloat(req.body.progressiveBasePrice)),
                    progressiveIncreasedPrice: Math.round(parseFloat(req.body.progressiveIncreasedPrice))
                };
                break;
            default:
                return res.status(400).json({ message: 'Invalid lens type' });
        }

        // Check if configuration already exists
        const existingLens = await Lens.findOne({ type, coating });
        if (existingLens) {
            return res.status(400).json({ message: 'Lens configuration already exists' });
        }

        const lens = new Lens({
            type,
            coating,
            ...priceFields
        });

        const newLens = await lens.save();
        res.status(201).json(newLens);
    } catch (error) {
        console.error('Error creating lens:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to create lens configuration' });
    }
});

// Update lens configuration (admin only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const lens = await Lens.findById(req.params.id);
        if (!lens) {
            return res.status(404).json({ message: 'Lens configuration not found' });
        }

        // Get the appropriate price fields based on lens type
        let priceFields = {};
        switch (lens.type) {
            case 'Single Vision':
                if (!req.body.singleVisionBasePrice || !req.body.singleVisionIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Single Vision lenses' });
                }
                priceFields = {
                    singleVisionBasePrice: Math.round(parseFloat(req.body.singleVisionBasePrice)),
                    singleVisionIncreasedPrice: Math.round(parseFloat(req.body.singleVisionIncreasedPrice))
                };
                break;
            case 'Bifocal':
                if (!req.body.bifocalBasePrice || !req.body.bifocalIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Bifocal lenses' });
                }
                priceFields = {
                    bifocalBasePrice: Math.round(parseFloat(req.body.bifocalBasePrice)),
                    bifocalIncreasedPrice: Math.round(parseFloat(req.body.bifocalIncreasedPrice))
                };
                break;
            case 'Progressive':
                if (!req.body.progressiveBasePrice || !req.body.progressiveIncreasedPrice) {
                    return res.status(400).json({ message: 'Both base and increased prices are required for Progressive lenses' });
                }
                priceFields = {
                    progressiveBasePrice: Math.round(parseFloat(req.body.progressiveBasePrice)),
                    progressiveIncreasedPrice: Math.round(parseFloat(req.body.progressiveIncreasedPrice))
                };
                break;
        }

        Object.assign(lens, priceFields);
        const updatedLens = await lens.save();
        res.json(updatedLens);
    } catch (error) {
        console.error('Error updating lens:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update lens configuration' });
    }
});

// Delete lens configuration (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const lens = await Lens.findById(req.params.id);
        if (!lens) {
            return res.status(404).json({ message: 'Lens configuration not found' });
        }

        await lens.deleteOne();
        res.json({ message: 'Lens configuration deleted successfully' });
    } catch (error) {
        console.error('Error deleting lens:', error);
        res.status(500).json({ message: 'Failed to delete lens configuration' });
    }
});

// Get available lens configurations by type
router.get('/configurations/:type', async (req, res) => {
    try {
        const { type } = req.params;
        console.log('Fetching configurations for type:', type);
        const configurations = await Lens.find({ type });
        console.log('Found configurations:', configurations);
        res.json(configurations);
    } catch (error) {
        console.error('Error fetching lens configurations:', error);
        res.status(500).json({ message: 'Failed to fetch lens configurations' });
    }
});

module.exports = router;