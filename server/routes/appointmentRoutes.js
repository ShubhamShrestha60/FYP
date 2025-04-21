const express = require('express');
const router = express.Router();
const { getAvailableSlots, bookAppointment, getUserAppointments } = require('../controllers/appointmentController');

// Public routes
router.get('/available-slots', getAvailableSlots);
router.post('/book', bookAppointment);
router.get('/user', getUserAppointments);

module.exports = router; 