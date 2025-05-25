import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Collection from "../pages/Collection";
import About from "../pages/About";
import Cart from "../pages/Cart";
import Contact from "../pages/Contact";
import Product from "../pages/Product";
import Login from "../pages/Login";
import PlaceOrder from "../pages/PlaceOrder";
import Orders from "../pages/Orders";
import Sunglasses from "../pages/Sunglasses";
import Eyeglasses from "../pages/Eyeglasses";
import ContactLens from "../pages/ContactLens";
import TryOn from "../pages/TryOn";
import Prescription from "../pages/Prescription";
import Signup from "../pages/Signup";
import Frame from "../components/Frame1";
import ProductNav from "../pages/ProductNav";
import Payment from "../Products/Payment";
import Profile from "../pages/Profile";
import Appointment from "../pages/Appointment";
import DoctorManagement from "../components/admin/DoctorManagement";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Favorites from "../pages/Favorites";

import AdminPrescriptions from '../pages/admin/AdminPrescriptions';
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import LensSelection from "../pages/LensSelection";
import SearchResults from "../pages/SearchResults";

import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

//For admin part 



const AllRoutes = () => {
  const { adminUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/sunglasses" element={<Sunglasses />} />
      <Route path="/eyeglasses" element={<Eyeglasses />} />
      <Route path="/prescription" element={<Prescription />} />
      <Route path="/lens-selection/:prescriptionId" element={<LensSelection />} />
      <Route path="/contactlens" element={<ContactLens />} />
      <Route path="/tryon" element={<TryOn />} />
      <Route path="/frame" element={<Frame />} />
      <Route path='/pronav' element={<ProductNav/>}/>
      <Route path='/payment' element={<Payment/>}/>
      <Route path="/profile" element={<Profile />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={adminUser ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/doctors" element={adminUser ? <DoctorManagement /> : <Navigate to="/admin/login" />} />
    </Routes>
  );
};

export default AllRoutes;
