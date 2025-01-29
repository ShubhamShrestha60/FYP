// Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import { FiShoppingCart, FiSearch } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { getCartCount } = useCart();

  return (
    <nav className="bg-black text-white sticky top-0 z-50">
      <div className="flex items-center py-5">
        <NavLink to="/" className="pl-14">
          <img src={assets.logo} alt="Logo" className="w-24" />
        </NavLink>

        <div className="max-w-[1400px] mx-auto flex-1 flex justify-end">
          {!showSearch ? (
            <div className="hidden md:flex items-center gap-12 text-[15px] font-medium">
              <NavLink 
                to="/sunglasses" 
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                Sunglasses
              </NavLink>
              
              <NavLink 
                to="/eyeglasses"
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                Eyeglasses
              </NavLink>
              
              <NavLink 
                to="/contactlens"
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                Contact Lens
              </NavLink>
              
              <NavLink 
                to="/tryon"
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                3D Try On
              </NavLink>
              
              <NavLink 
                to="/prescription"
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                Prescription
              </NavLink>

              <NavLink 
                to="/login"
                className={({ isActive }) => 
                  `px-6 py-2 rounded-full transition-all duration-300 mr-8 ${
                    isActive 
                      ? 'bg-red-500 text-white' 
                      : 'border-2 border-white hover:bg-white hover:text-black'
                  }`
                }
              >
                Login
              </NavLink>
            </div>
          ) : (
            <div className="flex-1 px-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full max-w-xl px-4 py-2 rounded text-black"
                autoFocus
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button onClick={() => setShowSearch(!showSearch)}>
              <FiSearch className="h-5 w-5" />
            </button>
            <Link to="/cart" className="relative">
              <FiShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {getCartCount()}
              </span>
            </Link>
          </div>

          <div className="md:hidden mr-4">
            <button className="p-2 hover:bg-gray-800 rounded-md transition-colors duration-300">
              <svg 
                className="h-6 w-6" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
