import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiShoppingBag, FiEye, FiSettings, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

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
            <h2 className="text-2xl font-semibold mb-4">My Prescriptions</h2>
            {/* Add prescriptions list here */}
          </div>
        );
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