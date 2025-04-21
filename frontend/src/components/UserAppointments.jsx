import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

const UserAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    } else {
      setError('Please log in to view your appointments');
      setLoading(false);
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching appointments for email:', user.email);
      
      const response = await axios.get(`${API_BASE_URL}/appointments/user`, {
        params: { email: user.email }
      });
      
      console.log('Appointments response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Only filter out appointments where the doctor is completely missing
        const validAppointments = response.data.data.filter(appointment => 
          appointment && appointment.doctorId
        );
        
        console.log('Filtered appointments:', validAppointments);
        setAppointments(validAppointments);
      } else {
        setError('No appointments found');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to fetch appointments. Please try again later.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
      
      {appointments.length === 0 ? (
        <div className="text-center text-gray-500">
          You have no appointments scheduled.
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={appointment.doctorId?.image || '/default-doctor.jpg'}
                    alt={appointment.doctorId?.name || 'Doctor'}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-doctor.jpg';
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{appointment.doctorId?.name || 'Doctor Not Available'}</h3>
                    <p className="text-gray-600">{appointment.doctorId?.specialization || 'Specialization not available'}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {format(new Date(appointment.appointmentDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{appointment.timeSlot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">{appointment.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency</p>
                  <p className="font-medium">{appointment.isEmergency ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAppointments; 