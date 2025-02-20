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
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

const App = () => {
  return (
    <CartProvider>
      <AuthProvider>
        <ProductProvider>
          <Routes>
            {/* Admin Routes should come before the public routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/*" element={<AllRoutes />} />
            </Route>

            {/* New route for CreateAdmin */}
            <Route path="/create-admin" element={<CreateAdmin />} />

            {/* New route for Checkout */}
            <Route path="/checkout" element={<Checkout />} />

            {/* New route for Order Success */}
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </CartProvider>
  );
};

export default App;
