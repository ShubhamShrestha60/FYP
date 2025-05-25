import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../common/Pagination';

const API_BASE_URL = 'http://localhost:5001/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters and Sort */}
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            <option value="Sunglasses">Sunglasses</option>
            <option value="Eyeglasses">Eyeglasses</option>
            <option value="Contact Lenses">Contact Lenses</option>
            <option value="Accessories">Accessories</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentItems.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  <p className="text-xl font-bold text-blue-600">${product.price}</p>
                  <button 
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
                    onClick={() => {/* Add to cart functionality */}}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ProductList; 