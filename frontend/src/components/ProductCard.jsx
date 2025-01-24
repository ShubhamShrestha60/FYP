import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Format price in Nepali Rupees with thousands separator
  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
          {product.isNew && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded">
              New
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.brand}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">{formatPrice(product.price)}</span>
            <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 