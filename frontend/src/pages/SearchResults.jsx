import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FiSearch } from 'react-icons/fi';
import ProductNav from './ProductNav';

const API_BASE_URL = 'http://localhost:5001/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = searchParams.get('q');

  const selectedColors = searchParams.getAll("color");
  const selectedBrands = searchParams.getAll("brand");
  const selectedShapes = searchParams.getAll("shape");
  const selectedMaterials = searchParams.getAll("material");
  const priceRange = searchParams.get("price");
  const order = searchParams.get("order");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, navigate]);

  let filteredProducts = [...products];

  if (selectedBrands.length) {
    filteredProducts = filteredProducts.filter(product => selectedBrands.includes(product.brand));
  }
  if (selectedColors.length) {
    filteredProducts = filteredProducts.filter(product => selectedColors.includes(product.specifications?.frameColor));
  }
  if (selectedShapes.length) {
    filteredProducts = filteredProducts.filter(product => selectedShapes.includes(product.specifications?.frameShape));
  }
  if (selectedMaterials.length) {
    filteredProducts = filteredProducts.filter(product =>
      selectedMaterials.map(m => m.toLowerCase()).includes(product.specifications?.material?.toLowerCase())
    );
  }
  if (priceRange && priceRange !== 'all') {
    const [min, max] = priceRange.split('-').map(Number);
    filteredProducts = filteredProducts.filter(product => {
      if (max) {
        return product.price >= min && product.price <= max;
      } else {
        return product.price >= min;
      }
    });
  }
  if (order) {
    filteredProducts.sort((a, b) => {
      if (order === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProductNav />
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            Found {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Results Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching "{query}"
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 