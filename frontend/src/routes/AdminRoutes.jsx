import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AdminNavbar from '../AdminPage/AdminNavbar';
import AdminDashboard from '../AdminPage/AdminDashboard';
import AdminProducts from '../AdminPage/AdminProducts';
import AdminSettings from '../AdminPage/AdminSettings';
import AdminLogin from '../AdminPage/AdminLogin';

const AdminRoutes = () => {
  const location = useLocation(); // Get the current location to check if we are on the login page

  return (
    <div>
      {/* Conditionally render the Navbar only if the route is not "/admin/login" */}
      {location.pathname !== '/admin/login' && <AdminNavbar />}

      <Routes>
  <Route path="dashboard" element={<AdminDashboard />} />
  <Route path="products" element={<AdminProducts />} />
  <Route path="settings" element={<AdminSettings />} />
  <Route path="login" element={<AdminLogin />} />
</Routes>

    </div>
  );
};

export default AdminRoutes;
