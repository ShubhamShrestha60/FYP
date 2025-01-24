import React from "react";
import { Routes, Route } from "react-router-dom";
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

//For admin part 



const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/sunglasses" element={<Sunglasses />} />
      <Route path="/eyeglasses" element={<Eyeglasses />} />
      <Route path="/prescription" element={<Prescription />} />
      <Route path="/contactlens" element={<ContactLens />} />
      <Route path="/tryon" element={<TryOn />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/frame" element={<Frame />} />
      <Route path='/pronav' element={<ProductNav/>}/>
      
    </Routes>
  );
};

export default AllRoutes;
