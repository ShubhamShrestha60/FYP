import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiUsers, FiEye, FiSliders, FiUserPlus } from 'react-icons/fi';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/admin/products" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiPackage className="text-2xl mb-2 text-blue-600" />
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-gray-600">Manage your product inventory</p>
        </Link>

        <Link 
          to="/admin/orders" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiShoppingBag className="text-2xl mb-2 text-green-600" />
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-gray-600">View and manage orders</p>
        </Link>

        <Link 
          to="/admin/prescriptions" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiEye className="text-2xl mb-2 text-red-600" />
          <h2 className="text-xl font-semibold">Prescriptions</h2>
          <p className="text-gray-600">Verify customer prescriptions</p>
        </Link>

        <Link 
          to="/admin/users" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiUsers className="text-2xl mb-2 text-purple-600" />
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-gray-600">Manage user accounts</p>
        </Link>

        <Link 
          to="/admin/lens-management" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiSliders className="text-2xl mb-2 text-orange-600" />
          <h2 className="text-xl font-semibold">Lens Management</h2>
          <p className="text-gray-600">Configure lens powers and pricing</p>
        </Link>

        <Link 
          to="/admin/doctors" 
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <FiUserPlus className="text-2xl mb-2 text-indigo-600" />
          <h2 className="text-xl font-semibold">Doctors</h2>
          <p className="text-gray-600">Manage doctors and appointments</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;