import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminPrescriptions from '../pages/admin/AdminPrescriptions';
import LensPowerManagement from '../components/admin/LensPowerManagement';
import DoctorManagement from '../components/admin/DoctorManagement';
import { useAuth } from '../context/AuthContext';

const AdminRoutes = () => {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public admin route */}
      <Route 
        path="login" 
        element={
          adminUser?.role === 'admin' ? 
            <Navigate to="/admin/dashboard" replace /> : 
            <AdminLogin />
        } 
      />

      {/* Protected admin routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="prescriptions" element={<AdminPrescriptions />} />
        <Route path="lens" element={<LensPowerManagement />} />
        <Route path="doctors" element={<DoctorManagement />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
