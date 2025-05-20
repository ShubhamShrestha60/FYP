const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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

// Email templates
const getStatusEmailTemplate = ({
  orderId,
  status,
  customerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  reason,
  notes
}) => {
  const statusColors = {
    pending: '#FFA500',
    processing: '#3B82F6',
    shipped: '#10B981',
    delivered: '#059669',
    cancelled: '#EF4444'
  };

  const statusMessages = {
    pending: 'Your order has been received and is pending confirmation.',
    processing: 'Your order is being processed and prepared for shipping.',
    shipped: 'Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been delivered successfully.',
    cancelled: 'Your order has been cancelled.'
  };

  const getTrackingInfo = () => {
    if (status === 'shipped' && trackingNumber) {
      return `
        <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #1E40AF; margin: 0 0 10px 0;">Tracking Information</h3>
          <p style="margin: 5px 0;">
            <strong>Tracking Number:</strong> ${trackingNumber}
            ${carrier ? `<br><strong>Carrier:</strong> ${carrier}` : ''}
            ${estimatedDelivery ? `<br><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}` : ''}
          </p>
        </div>
      `;
    }
    return '';
  };

  const getCancellationInfo = () => {
    if (status === 'cancelled' && reason) {
      return `
        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #991B1B; margin: 0 0 10px 0;">Cancellation Details</h3>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
        </div>
      `;
    }
    return '';
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="${process.env.SITE_URL}/logo.png" alt="Opera Eye Wear" style="max-width: 200px;">
      </div>

      <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #111827; margin: 0 0 10px 0;">Order Status Update</h2>
        <p style="color: #4B5563; margin: 0;">Dear ${customerName},</p>
      </div>

      <div style="background-color: ${statusColors[status]}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0; text-transform: capitalize;">${status}</h3>
        <p style="margin: 5px 0 0 0;">${statusMessages[status]}</p>
      </div>

      <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin: 0 0 10px 0;">Order Details</h3>
        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
        ${getTrackingInfo()}
        ${getCancellationInfo()}
        ${notes ? `<p style="margin: 15px 0;"><strong>Additional Notes:</strong> ${notes}</p>` : ''}
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.SITE_URL}/orders" 
           style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Order Details
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 14px;">
        <p>If you have any questions, please contact our customer support.</p>
        <p>© ${new Date().getFullYear()} Opera Eye Wear. All rights reserved.</p>
      </div>
    </div>
  `;
};

// Send order status update email
const sendOrderStatusEmail = async (data) => {
  try {
    const mailOptions = {
      from: `"Opera Eye Wear" <${process.env.SMTP_FROM}>`,
      to: data.to,
      subject: `Order Status Update - ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`,
      html: getStatusEmailTemplate(data)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status email sent to ${data.to} for order ${data.orderId}`);
  } catch (error) {
    console.error('Error sending order status email:', error);
    // Don't throw the error to prevent blocking the order update process
  }
};

module.exports = {
  sendDoctorNotification,
  sendPatientConfirmation,
  sendPrescriptionStatusNotification,
  sendOrderStatusEmail
};