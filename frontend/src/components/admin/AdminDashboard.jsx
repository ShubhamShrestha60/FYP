import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/admin/products" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-gray-600">Manage your product inventory</p>
        </Link>
        <Link 
          to="/admin/orders" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-gray-600">View and manage orders</p>
        </Link>
        <Link 
          to="/admin/users" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-gray-600">Manage user accounts</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 