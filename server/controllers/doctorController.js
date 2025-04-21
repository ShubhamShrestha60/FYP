const Doctor = require('../models/Doctor');

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      specialization,
      experience,
      email,
      phone,
      image,
      availableDays,
      availableTimeSlots
    } = req.body;

    // Validate required fields
    if (!name || !specialization || !experience || !email || !phone || !availableDays || !availableTimeSlots) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate availableDays
    if (!Array.isArray(availableDays) || availableDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Available days must be a non-empty array'
      });
    }

    // Validate availableTimeSlots
    if (!Array.isArray(availableTimeSlots) || availableTimeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Available time slots must be a non-empty array'
      });
    }

    // Check if doctor with same email exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    const doctor = new Doctor({
      name,
      specialization,
      experience,
      email,
      phone,
      image: image || 'default-doctor.jpg',
      availableDays,
      availableTimeSlots
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding doctor',
      error: error.message
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      specialization,
      experience,
      email,
      phone,
      availableDays,
      availableTimeSlots,
      image
    } = req.body;

    // Validate required fields
    if (!name || !specialization || !experience || !email || !phone || !availableDays || !availableTimeSlots) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate availableDays
    if (!Array.isArray(availableDays) || availableDays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Available days must be a non-empty array'
      });
    }

    // Validate availableTimeSlots
    if (!Array.isArray(availableTimeSlots) || availableTimeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Available time slots must be a non-empty array'
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      {
        name,
        specialization,
        experience,
        email,
        phone,
        availableDays,
        availableTimeSlots,
        image: image || 'default-doctor.jpg'
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
};

module.exports = {
  getAllDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor
}; 