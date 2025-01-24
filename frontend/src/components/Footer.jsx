import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p className="text-gray-400">
              Opera Eye Wear provides premium quality eyewear for fashion-conscious individuals.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/sunglasses" className="text-gray-400 hover:text-white">Sunglasses</Link></li>
              <li><Link to="/eyeglasses" className="text-gray-400 hover:text-white">Eyeglasses</Link></li>
              <li><Link to="/contactlens" className="text-gray-400 hover:text-white">Contact Lenses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white">Returns & Exchanges</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-gray-800 text-white px-4 py-2 rounded-l focus:outline-none"
              />
              <button className="bg-red-600 text-white px-4 py-2 rounded-r hover:bg-red-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 