const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendDoctorNotification = async (doctorEmail, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: doctorEmail,
    subject: 'New Appointment Booking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Appointment Booking</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p><strong>Patient Name:</strong> ${appointmentDetails.patientName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDetails.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointmentDetails.timeSlot}</p>
          <p><strong>Reason:</strong> ${appointmentDetails.reason}</p>
          ${appointmentDetails.isEmergency ? '<p style="color: red; font-weight: bold;">⚠️ EMERGENCY APPOINTMENT</p>' : ''}
          <p><strong>Contact:</strong> ${appointmentDetails.patientPhone}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending doctor notification:', error);
    return false;
  }
};

const sendPatientConfirmation = async (patientEmail, appointmentDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: patientEmail,
    subject: 'Appointment Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Appointment Confirmation</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Your appointment has been successfully booked!</p>
          <p><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
          <p><strong>Date:</strong> ${new Date(appointmentDetails.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointmentDetails.timeSlot}</p>
          <p><strong>Reason:</strong> ${appointmentDetails.reason}</p>
          ${appointmentDetails.isEmergency ? '<p style="color: red; font-weight: bold;">⚠️ EMERGENCY APPOINTMENT</p>' : ''}
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending patient confirmation:', error);
    return false;
  }
};

const sendPrescriptionStatusNotification = async (userEmail, prescriptionDetails) => {
  const statusMessages = {
    verified: 'approved',
    rejected: 'rejected'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Prescription ${statusMessages[prescriptionDetails.status]} Notification`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Prescription ${statusMessages[prescriptionDetails.status]}</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p>Your prescription has been ${statusMessages[prescriptionDetails.status]}.</p>
          ${prescriptionDetails.verificationNotes ? `<p><strong>Notes:</strong> ${prescriptionDetails.verificationNotes}</p>` : ''}
          <p><strong>Prescription Type:</strong> ${prescriptionDetails.prescriptionType}</p>
          <p><strong>Usage:</strong> ${prescriptionDetails.usage}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending prescription status notification:', error);
    return false;
  }
};

module.exports = {
  sendDoctorNotification,
  sendPatientConfirmation,
  sendPrescriptionStatusNotification
};