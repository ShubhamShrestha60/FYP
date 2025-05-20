import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Check if product has virtual try-on images and is eyeglasses or sunglasses
  const hasTryOnFeature = product.virtualTryOnImages && 
                         product.virtualTryOnImages.length > 0 && 
                         (product.category === 'eyeglasses' || product.category === 'sunglasses');
  
  const handleTryOnClick = (e) => {
    e.preventDefault(); // Prevent navigation to product detail
    window.location.href = `/tryon?productId=${product._id}`;
  };

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link
        to={`/product/${product._id}`}
        className="block"
      >
      {/* Image Container with fixed aspect ratio and proper sizing */}
      <div className="relative w-full pt-[100%]"> {/* 1:1 aspect ratio */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-4 bg-white"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg'; // Fallback image
          }}
        />
        
        {/* Gender Badge */}
        <span className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 text-xs rounded-full">
          {product.specifications.gender.charAt(0).toUpperCase() + 
           product.specifications.gender.slice(1)}
        </span>

        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 text-xs rounded">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-red-600">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Material Badge */}
          <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
            {product.specifications.material}
          </span>
          
          {/* Category Badge */}
          <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <p className="text-lg font-bold text-red-600">
            Rs. {product.price.toFixed(2)}
          </p>
          <div className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>
        </div>
      </div>
    </Link>
    
    {/* Try On Button - Only show for eyeglasses and sunglasses with virtual try-on images */}
    {hasTryOnFeature && (
      <div className="px-4 pb-4">
        <button
          onClick={handleTryOnClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Virtual Try On
        </button>
      </div>
    )}
  </div>
  );
};

export default ProductCard;