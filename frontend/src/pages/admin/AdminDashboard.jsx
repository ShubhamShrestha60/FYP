import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Products"
          count={stats.products}
          link="/admin/products"
          description="Manage inventory"
          icon="📦"
        />
        <DashboardCard
          title="Total Orders"
          count={stats.orders}
          link="/admin/orders"
          description="View all orders"
          icon="🛍️"
        />
        <DashboardCard
          title="Total Users"
          count={stats.users}
          link="/admin/users"
          description="Manage users"
          icon="👥"
        />
        <DashboardCard
          title="Revenue"
          count={`$${stats.revenue.toLocaleString()}`}
          link="/admin/finance"
          description="Financial overview"
          icon="💰"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickActionButton
              title="Add New Product"
              link="/admin/products/new"
              icon="➕"
            />
            <QuickActionButton
              title="Process Orders"
              link="/admin/orders"
              icon="📋"
            />
            <QuickActionButton
              title="View Reports"
              link="/admin/reports"
              icon="📊"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {/* Add recent activity items here */}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, count, link, description, icon }) => (
  <Link
    to={link}
    className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-3xl font-bold text-red-600 my-2">{count}</p>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

const QuickActionButton = ({ title, link, icon }) => (
  <Link
    to={link}
    className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50 transition-colors"
  >
    <span>{icon}</span>
    <span>{title}</span>
  </Link>
);

export default AdminDashboard; 