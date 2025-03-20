import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiHeart, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';
import { Link } from 'react-router-dom';

const Collection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    priceRange: 'all',
    gender: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const filterProducts = (products) => {
    return products.filter(product => {
      if (filters.category !== 'all' && product.category !== filters.category) return false;
      if (filters.brand !== 'all' && product.brand !== filters.brand) return false;
      if (filters.gender !== 'all' && product.specifications?.gender !== filters.gender) return false;
      if (filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (product.price < min || product.price > max) return false;
      }
      return true;
    });
  };

  const sortProducts = (products) => {
    switch (sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'newest':
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return products;
    }
  };

  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[40vh] bg-gradient-to-r from-gray-900 to-black flex items-center justify-center"
      >
        <div className="absolute inset-0 opacity-30 bg-[url('/path/to/pattern.png')] bg-repeat"/>
        <div className="text-center z-10 space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white"
          >
            Luxury Eyewear Collection
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-200 text-lg max-w-2xl mx-auto px-4"
          >
            Discover our curated selection of premium eyewear
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white shadow-sm border border-gray-100 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <FiFilter />
              <span>Filters</span>
            </button>
            
            <div className="h-6 w-px bg-gray-200"/>
            
            <span className="text-gray-500 text-sm">
              {filteredAndSortedProducts.length} Products
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-red-500"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>

        {/* Filter Panel */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0 }}
          className="overflow-hidden mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white shadow-sm border border-gray-100 rounded-lg">
            {/* Category Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                {['All', 'Sunglasses', 'Eyeglasses', 'Contact Lenses'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-gray-600 hover:text-red-600 cursor-pointer">
                    <input 
                      type="radio"
                      name="category"
                      value={cat.toLowerCase()}
                      checked={filters.category === cat.toLowerCase()}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="accent-red-600"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Add more filter sections as needed */}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <Link 
              to={`/product/${product._id}`}
              key={product._id}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 transition-colors">
                      <FiHeart className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 transition-colors">
                      <FiShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-red-600">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
                    >
                      View
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
