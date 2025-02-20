import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from '../components/admin/AdminNavbar';

const AdminLayout = () => {
  const { adminUser, loading } = useAuth();

  useEffect(() => {
    console.log('AdminLayout - adminUser:', adminUser);
    console.log('AdminLayout - loading:', loading);
  }, [adminUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
      </div>
    );
  }

  // Check if user is admin
  if (!adminUser || adminUser.role !== 'admin') {
    console.log('Not admin, redirecting to login...');
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 