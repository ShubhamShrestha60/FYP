import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShoppingBag, FiEye, FiSettings, FiLogOut, FiCalendar, FiLock, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import UserAppointments from '../components/UserAppointments';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { toast } from 'react-toastify';
import Orders from './Orders';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
  }, [activeTab, user]);

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

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter";
    if (!hasNumbers) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    
    return "";
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setLoading(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
      }

      // Validate password strength
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setPasswordSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        { name: editName, phone: editPhone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        toast.success('Profile updated successfully');
        if (typeof user === 'object') {
          user.name = response.data.user.name;
          user.phone = response.data.user.phone;
        }
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete (disable) your account?')) return;
    try {
      await axios.post(`${API_BASE_URL}/auth/disable-account`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Your account has been disabled.');
      logout();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to disable account');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="text-gray-600">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-600">Phone</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      onClick={() => setIsEditing(false)}
                      disabled={profileLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
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
                  <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case 'orders':
        return <Orders />;
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
            <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
            
            {/* Change Password Section */}
            <div className="border rounded-lg overflow-hidden mb-6">
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiLock className="w-5 h-5" />
                  <span className="font-medium">Change Password</span>
                </div>
                <FiChevronDown className={`w-5 h-5 transform transition-transform ${showPasswordSection ? 'rotate-180' : ''}`} />
              </button>
              
              {showPasswordSection && (
                <div className="p-4 border-t">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Password must contain:
                      <ul className="list-disc list-inside">
                        <li>At least 8 characters</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
                        <li>One number</li>
                        <li>One special character</li>
                      </ul>
                    </div>
                    {passwordError && (
                      <p className="text-red-600 text-sm">{passwordError}</p>
                    )}
                    {passwordSuccess && (
                      <p className="text-green-600 text-sm">{passwordSuccess}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
            {/* Delete Account Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <FiLock className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </button>
              <p className="text-xs text-gray-500 p-4">This will disable your account. You can reactivate it later by logging in again.</p>
            </div>
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