import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = ({ children }) => {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!adminUser || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default AdminLayout; 