import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5001/api';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    email: '',
    phone: '',
    image: '',
    availableDays: [],
    availableTimeSlots: []
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'availableDays' || name === 'availableTimeSlots') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEdit = (doctor) => {
    console.log('Editing doctor:', doctor);
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      email: doctor.email,
      phone: doctor.phone,
      image: doctor.image || '',
      availableDays: Array.isArray(doctor.availableDays) ? doctor.availableDays : [],
      availableTimeSlots: Array.isArray(doctor.availableTimeSlots) ? doctor.availableTimeSlots : []
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      experience: '',
      email: '',
      phone: '',
      image: '',
      availableDays: [],
      availableTimeSlots: []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!formData.name || !formData.specialization || !formData.experience || 
          !formData.email || !formData.phone || 
          !formData.availableDays.length || !formData.availableTimeSlots.length) {
        setError('Please fill in all required fields');
        return;
      }

      console.log('Submitting form data:', formData);
      
      if (editingDoctor) {
        console.log('Updating doctor with ID:', editingDoctor._id);
        const response = await axios.put(
          `${API_BASE_URL}/doctors/${editingDoctor._id}`, 
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Update response:', response);
        setSuccess('Doctor updated successfully');
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/doctors`, 
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log('Create response:', response);
        setSuccess('Doctor added successfully');
      }
      fetchDoctors();
      handleCancel();
    } catch (error) {
      console.error('Error saving doctor:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/doctors/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        setError(error.response?.data?.message || 'Failed to delete doctor');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctor Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add New Doctor'}
        </button>
      </div>

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

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableDays"
                    value={day}
                    checked={formData.availableDays.includes(day)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {timeSlots.map(slot => (
                <label key={slot} className="flex items-center">
                  <input
                    type="checkbox"
                    name="availableTimeSlots"
                    value={slot}
                    checked={formData.availableTimeSlots.includes(slot)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2">{slot}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <img
                  src={doctor.image || '/default-doctor.jpg'}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-doctor.jpg';
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit Doctor"
                  >
                    <FiEdit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Doctor"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">{doctor.experience} years experience</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Available Days:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doctor.availableDays.map(day => (
                    <span key={day} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">Available Time Slots:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {doctor.availableTimeSlots.map(slot => (
                    <span key={slot} className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorManagement; 