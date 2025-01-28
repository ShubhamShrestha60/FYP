import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-semibold">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="hover:text-red-500">Dashboard</Link>
            <Link to="/admin/products" className="hover:text-red-500">Products</Link>
            <Link to="/admin/orders" className="hover:text-red-500">Orders</Link>
            <Link to="/admin/users" className="hover:text-red-500">Users</Link>
            <Link to="/admin/settings" className="hover:text-red-500">Settings</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 