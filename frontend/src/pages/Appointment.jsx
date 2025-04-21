import React from 'react';
import AppointmentBooking from '../components/AppointmentBooking';

const Appointment = () => {
  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Eye Exam</h1>
            <p className="text-lg text-gray-600 mb-8">
              Please <a href="/login" className="text-blue-500 hover:text-blue-700">login</a> to book an appointment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Eye Exam</h1>
          <p className="text-lg text-gray-600">
            Schedule an appointment with our expert optometrists for a comprehensive eye examination
          </p>
        </div>
        <AppointmentBooking />
      </div>
    </div>
  );
};

export default Appointment; 