import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductNav from './ProductNav';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const Eyeglasses = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        // Filter only eyeglasses products
        const eyeglassesProducts = response.data.filter(
          product => product.category === 'eyeglasses'
        );
        setProducts(eyeglassesProducts);
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
    
    const selectedColors = searchParams.getAll("color");
    const selectedBrands = searchParams.getAll("brand");
    const selectedShapes = searchParams.getAll("shape");
    const selectedMaterials = searchParams.getAll("material");
    const priceRange = searchParams.get("price");
    const order = searchParams.get("order");

    if (selectedBrands.length) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
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
        } else {
          return b.price - a.price;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [searchParams, products]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No products match your selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Eyeglasses;
