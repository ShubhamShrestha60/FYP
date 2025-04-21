const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { sendDoctorNotification, sendPatientConfirmation } = require('../services/emailService');

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
];

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Get the doctor's available time slots
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get all appointments for the selected date
    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(date),
      status: { $ne: 'cancelled' }
    });

    // Get booked time slots
    const bookedSlots = appointments.map(appointment => appointment.timeSlot);

    // Filter out booked slots from doctor's available slots
    const availableSlots = doctor.availableTimeSlots.filter(
      slot => !bookedSlots.includes(slot)
    );

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting available slots',
      error: error.message
    });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      patientName,
      patientEmail,
      patientPhone,
      reason,
      isEmergency
    } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !timeSlot || !patientName || !patientEmail || !patientPhone || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if the doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      patientName,
      patientEmail,
      patientPhone,
      reason,
      isEmergency,
      status: 'confirmed'
    });

    await appointment.save();

    // Send notifications
    await sendDoctorNotification(doctor.email, {
      patientName,
      appointmentDate,
      timeSlot,
      reason,
      isEmergency,
      patientPhone
    });

    await sendPatientConfirmation(patientEmail, {
      doctorName: doctor.name,
      appointmentDate,
      timeSlot,
      reason,
      isEmergency
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking appointment',
      error: error.message
    });
  }
};

const getUserAppointments = async (req, res) => {
  try {
    const { email } = req.query;
    console.log('Received request for appointments with email:', email);

    if (!email) {
      console.log('No email provided in request');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('Fetching appointments from database...');
    const appointments = await Appointment.find({ patientEmail: email })
      .populate('doctorId', 'name specialization image')
      .sort({ appointmentDate: 1 });

    console.log('Found appointments:', appointments.length);
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Error in getUserAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getUserAppointments
}; 