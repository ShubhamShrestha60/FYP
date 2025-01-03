// Navbar.jsx
import React from 'react';
import { assets } from '../assets/assets';  // Make sure the import path is correct
import { NavLink } from 'react-router-dom';
const Navbar = () => {
  return (
    <nav className="bg-black text-white">
    <div className="flex items-center justify-between py-5 font-medium">
     <NavLink to="/">
      <img src={assets.logo} alt="Logo" className="w-24" /> </NavLink>
      <NavLink to="/sunglasses" ><p>Sunglasses</p> </NavLink>
        <NavLink to='/eyeglasses'><p>Eyeglasses</p> </NavLink>
        <NavLink to='/contactlens'><p>Contact Lens</p> </NavLink>
        <NavLink to='/tryon'><p>3D Try On</p> </NavLink>
        <NavLink to = '/prescription'><p>Prescription</p> </NavLink>
        <NavLink to = '/login' className='mr-4'><p>Login</p> </NavLink>
    </div>
   </nav>
  );
};

export default Navbar;
