// Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

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
                to="/appointment"
                className={({ isActive }) => 
                  `hover:text-red-500 transition-colors duration-300 border-b-2 border-transparent ${
                    isActive ? 'border-red-500 text-red-500' : 'hover:border-red-500'
                  }`
                }
              >
                Book Appointment
              </NavLink>

              <div className="flex items-center space-x-8">
                <button onClick={() => setShowSearch(!showSearch)}>
                  <FiSearch className="h-5 w-5 hover:text-red-500 transition-colors duration-300" />
                </button>
                
                <Link to="/cart" className="relative">
                  <FiShoppingCart className="h-5 w-5 hover:text-red-500 transition-colors duration-300" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                </Link>

                {user && (
                  <Link to="/favorites" className="relative">
                    <FiHeart className="h-5 w-5 hover:text-red-500 transition-colors duration-300" />
                  </Link>
                )}

                {user ? (
                  <NavLink 
                    to="/profile"
                    className={({ isActive }) => `
                      w-10 h-10 rounded-full border-2 border-white flex items-center justify-center
                      hover:bg-white hover:text-black transition-all duration-300
                      ${isActive ? 'bg-white text-black' : ''}
                    `}
                  >
                    <FiUser className="w-5 h-5" />
                  </NavLink>
                ) : (
                  <NavLink 
                    to="/login"
                    className={({ isActive }) => 
                      `px-6 py-2 rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-red-500 text-white' 
                          : 'border-2 border-white hover:bg-white hover:text-black'
                      }`
                    }
                  >
                    Login
                  </NavLink>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="flex-1 px-4">
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="Search for sunglasses, eyeglasses, or contact lenses..."
                  className="w-full px-4 py-2 rounded text-black pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500"
                >
                  <FiSearch className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          <div className="md:hidden mr-4">
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-800 rounded-md transition-colors duration-300"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink 
              to="/sunglasses" 
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              Sunglasses
            </NavLink>
            <NavLink 
              to="/eyeglasses"
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              Eyeglasses
            </NavLink>
            <NavLink 
              to="/contactlens"
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              Contact Lens
            </NavLink>
            <NavLink 
              to="/tryon"
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              3D Try On
            </NavLink>
            <NavLink 
              to="/prescription"
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              Prescription
            </NavLink>
            <NavLink 
              to="/appointment"
              className="block px-3 py-2 text-white hover:text-red-500"
              onClick={toggleMenu}
            >
              Book Appointment
            </NavLink>
            {user && (
              <NavLink 
                to="/favorites"
                className="block px-3 py-2 text-white hover:text-red-500"
                onClick={toggleMenu}
              >
                Favorites
              </NavLink>
            )}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full px-4 py-2 rounded text-black pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500"
                    >
                      <FiSearch className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;