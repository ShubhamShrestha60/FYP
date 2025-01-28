import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import AdminRoutes from './routes/AdminRoutes';
import PublicLayout from './layouts/PublicLayout';
import AllRoutes from './routes/AllRoutes';
import ProductNav from './pages/ProductNav';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import { ProtectedRoute } from './components/ProtectedRoute';
import CreateAdmin from './pages/CreateAdmin';

const App = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <Routes>
          {/* Admin Routes - completely separate from public layout */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Public Routes - with public layout */}
          <Route element={<PublicLayout />}>
            <Route path="/*" element={<AllRoutes />} />
          </Route>

          {/* New route for CreateAdmin */}
          <Route path="/create-admin" element={<CreateAdmin />} />
        </Routes>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
