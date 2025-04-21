import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShoppingBag, FiEye, FiSettings, FiLogOut, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import UserAppointments from '../components/UserAppointments';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-600">Name</label>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-gray-600">Email</label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-gray-600">Phone</label>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">My Orders</h2>
            {/* Add orders list here */}
          </div>
        );
      case 'prescriptions':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Prescriptions</h2>
              <button
                onClick={() => navigate('/prescription')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Add New Prescription
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No prescriptions found. Add your first prescription to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{prescription.patientName}</h3>
                        <p className="text-gray-600">{new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${prescription.status === 'verified' ? 'bg-green-100 text-green-800' : prescription.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Right Eye</h4>
                        <div className="space-y-1 text-sm">
                          <p>Sphere: {prescription.rightEye.sphere}</p>
                          <p>Cylinder: {prescription.rightEye.cylinder}</p>
                          <p>Axis: {prescription.rightEye.axis}°</p>
                          <p>PD: {prescription.rightEye.pd} mm</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Left Eye</h4>
                        <div className="space-y-1 text-sm">
                          <p>Sphere: {prescription.leftEye.sphere}</p>
                          <p>Cylinder: {prescription.leftEye.cylinder}</p>
                          <p>Axis: {prescription.leftEye.axis}°</p>
                          <p>PD: {prescription.leftEye.pd} mm</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {prescription.prescriptionType}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Usage:</span> {prescription.usage}
                      </p>
                      {prescription.addition && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Addition:</span> {prescription.addition}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'appointments':
        return <UserAppointments />;
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
            {/* Add settings form here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-6 h-fit">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <FiUser className="w-10 h-10 text-gray-500" />
                </div>
              </div>
              <div className="text-center mb-6">
                <h2 className="font-semibold text-xl">{user?.name}</h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiUser /> Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiShoppingBag /> Orders
                </button>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'prescriptions' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiEye /> Prescriptions
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'appointments' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiCalendar /> Appointments
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-red-500 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <FiSettings /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut /> Logout
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;