import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isSameDay, parseISO } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

const AppointmentBooking = () => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  // Form data
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: null,
    timeSlot: '',
    patientName: user?.name || '',
    patientEmail: user?.email || '',
    patientPhone: user?.phone || '',
    reason: '',
    isEmergency: false
  });

  // Available time slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/doctors`);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to fetch doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({ ...formData, doctorId: doctor._id });
  };

  const isDateAvailable = (date) => {
    if (!selectedDoctor) return false;
    const dayName = format(date, 'EEEE'); // Gets the day name (e.g., 'Monday')
    return selectedDoctor.availableDays.includes(dayName);
  };

  const handleDateSelect = async (date) => {
    if (!isDateAvailable(date)) {
      setError('Selected date is not available for this doctor');
      return;
    }
    setFormData({ ...formData, appointmentDate: date });
    setError('');
    await fetchAvailableSlots(formData.doctorId, date);
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/appointments/available-slots`, {
        params: { doctorId, date: format(date, 'yyyy-MM-dd') }
      });
      setAvailableSlots(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/appointments/book`, {
        ...formData,
        appointmentDate: format(formData.appointmentDate, 'yyyy-MM-dd')
      });
      setSuccess('Appointment booked successfully!');
      setStep(1);
      setFormData({
        doctorId: '',
        appointmentDate: null,
        timeSlot: '',
        patientName: user?.name || '',
        patientEmail: user?.email || '',
        patientPhone: user?.phone || '',
        reason: '',
        isEmergency: false
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Doctor</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="text-center text-gray-500">No doctors available at the moment</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className={`p-4 border rounded-lg cursor-pointer ${
                formData.doctorId === doctor._id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <img
                src={doctor.image || '/default-doctor.jpg'}
                alt={doctor.name}
                className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                onError={(e) => {
                  e.target.src = '/default-doctor.jpg';
                }}
              />
              <h3 className="text-lg font-semibold text-center">{doctor.name}</h3>
              <p className="text-gray-600 text-center">{doctor.specialization}</p>
              <p className="text-sm text-gray-500 text-center">{doctor.experience} years experience</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Available Days:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doctor.availableDays.map(day => (
                    <span key={day} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!formData.doctorId}
        onClick={() => setStep(2)}
      >
        Next
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Date and Time</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <Calendar
            onChange={handleDateSelect}
            value={formData.appointmentDate}
            minDate={new Date()}
            className="border rounded-lg p-4"
          />
        </div>
        <div className="w-full md:w-1/2">
          <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center text-gray-500">No available slots for the selected date</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  className={`p-2 border rounded ${
                    formData.timeSlot === slot ? 'bg-blue-500 text-white' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, timeSlot: slot })}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => setStep(1)}
        >
          Back
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!formData.appointmentDate || !formData.timeSlot}
          onClick={() => setStep(3)}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Patient Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isEmergency"
            checked={formData.isEmergency}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">Emergency Appointment</label>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => setStep(2)}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default AppointmentBooking; 