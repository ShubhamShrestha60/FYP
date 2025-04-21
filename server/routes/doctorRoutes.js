const express = require('express');
const router = express.Router();
const { getAllDoctors, addDoctor, deleteDoctor, updateDoctor } = require('../controllers/doctorController');
const { isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllDoctors);

// Admin protected routes
router.post('/', isAdmin, addDoctor);
router.put('/:id', isAdmin, updateDoctor);
router.delete('/:id', isAdmin, deleteDoctor);

module.exports = router; 