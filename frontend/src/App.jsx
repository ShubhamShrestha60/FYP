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
import PaymentSuccess from './pages/PaymentSuccess';
import Orders from './pages/Orders';

const App = () => {
  return (
    <CartProvider>
      <AuthProvider>
        <ProductProvider>
          <Routes>
            {/* Admin Routes should come first */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/*" element={<AllRoutes />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />

            {/* Order Success and Payment Routes */}
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </CartProvider>
  );
};

export default App;