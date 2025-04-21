const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  image: {
    type: String,
    default: 'default-doctor.jpg'
  },
  availableDays: {
    type: [String],
    required: [true, 'Available days are required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  availableTimeSlots: {
    type: [String],
    required: [true, 'Available time slots are required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-delete hook to handle associated appointments
doctorSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doctorId = this.getQuery()._id;
    const Appointment = mongoose.model('Appointment');
    
    // Delete all appointments associated with this doctor
    await Appointment.deleteMany({ doctorId });
    console.log(`Deleted all appointments for doctor ${doctorId}`);
    next();
  } catch (error) {
    console.error('Error in doctor pre-delete hook:', error);
    next(error);
  }
});

module.exports = mongoose.model('Doctor', doctorSchema); 