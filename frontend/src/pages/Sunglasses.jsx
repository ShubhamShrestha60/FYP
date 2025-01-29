import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductNav from './ProductNav';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const Sunglasses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use the category endpoint specifically for sunglasses
        const response = await axios.get(`${API_BASE_URL}/products/category/sunglasses`);
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters when products or search params change
  useEffect(() => {
    let filtered = [...products];
    
    // Gender filter
    if (selectedGender !== 'all') {
      filtered = filtered.filter(product => 
        product.specifications.gender === selectedGender
      );
    }
    
    const selectedBrands = searchParams.getAll("brand");
    const selectedMaterials = searchParams.getAll("material");
    const priceRange = searchParams.get("price");
    const order = searchParams.get("order");

    if (selectedBrands.length) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    if (selectedMaterials.length) {
      filtered = filtered.filter(product => 
        selectedMaterials.includes(product.specifications.material)
      );
    }

    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    if (order) {
      filtered.sort((a, b) => {
        if (order === 'asc') {
          return a.price - b.price;
        } else if (order === 'desc') {
          return b.price - a.price;
        }
        return 0;
      });
    }

    setFilteredProducts(filtered);
  }, [searchParams, products, selectedGender]);

  const handleGenderFilter = (gender) => {
    setSelectedGender(gender);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductNav />
      <div className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="mb-8">
          {/* Gender Filter Buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-gray-700 font-medium">Filter by:</span>
            <div className="flex gap-3">
              <button
                onClick={() => handleGenderFilter('all')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedGender === 'all'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleGenderFilter('men')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedGender === 'men'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Men
              </button>
              <button
                onClick={() => handleGenderFilter('women')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedGender === 'women'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`} 
              >
                Women
              </button>
              <button
                onClick={() => handleGenderFilter('kids')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedGender === 'kids'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Kids
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedGender !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}
                <button
                  onClick={() => handleGenderFilter('all')}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No sunglasses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sunglasses;
