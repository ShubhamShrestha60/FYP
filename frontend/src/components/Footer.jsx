import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-2xl font-bold">Opera Eye Wear</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Nepal's premier destination for luxury eyewear. We bring you the finest collection of designer frames and precision optics, ensuring exceptional vision and style.
            </p>
            <div className="flex space-x-6 pt-2">
              <motion.a 
                href="https://www.instagram.com/operaeyewear.nepal/" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: '#E1306C' }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiInstagram size={20} />
              </motion.a>
              <motion.a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: '#4267B2' }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiFacebook size={20} />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, color: '#1DA1F2' }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiTwitter size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/sunglasses" className="text-gray-400 hover:text-red-500 transition-colors">
                  Luxury Sunglasses
                </Link>
              </li>
              <li>
                <Link to="/eyeglasses" className="text-gray-400 hover:text-red-500 transition-colors">
                  Premium Eyeglasses
                </Link>
              </li>
              <li>
                <Link to="/contactlens" className="text-gray-400 hover:text-red-500 transition-colors">
                  Contact Lenses
                </Link>
              </li>
              <li>
                <Link to="/tryon" className="text-gray-400 hover:text-red-500 transition-colors">
                  Virtual Try-On Experience
                </Link>
              </li>
              <li>
                <Link to="/prescription" className="text-gray-400 hover:text-red-500 transition-colors">
                  Prescription Services
                </Link>
              </li>
              <li>
                <Link to="/appointment" className="text-gray-400 hover:text-red-500 transition-colors">
                  Book Eye Exam
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiMapPin className="text-red-500 flex-shrink-0" />
                <span>Durbar Marg, Kathmandu 44600, Nepal</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiPhone className="text-red-500 flex-shrink-0" />
                <span>+977 1-4XXXXXX</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 text-sm">
                <FiMail className="text-red-500 flex-shrink-0" />
                <span>info@operaeyewear.com.np</span>
              </div>
            </div>
            <div className="pt-2 text-sm text-gray-400">
              <p>Business Hours:</p>
              <p>Sun - Fri: 10:00 AM - 7:00 PM</p>
              <p>Saturday: Closed</p>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="text-gray-400 text-sm">
              Subscribe to receive exclusive offers and the latest eyewear trends.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-red-500 text-white text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-16">
          <div className="pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Opera Eye Wear. All rights reserved. | Reg. No: XXXXXXX</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 