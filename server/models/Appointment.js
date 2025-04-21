const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of available slots
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 });

// Add a method to check if appointment is completed
appointmentSchema.methods.isCompleted = function() {
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes, period] = this.timeSlot.split(/:|\s/);
  let hour = parseInt(hours);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  appointmentDateTime.setHours(hour, parseInt(minutes), 0, 0);
  
  return appointmentDateTime < new Date();
};

// Add a pre-save middleware to update status to completed if appointment time has passed
appointmentSchema.pre('save', function(next) {
  if (this.status === 'confirmed' && this.isCompleted()) {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema); 