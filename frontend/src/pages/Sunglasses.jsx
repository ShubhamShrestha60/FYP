import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductNav from './ProductNav';
import ProductCard from '../components/ProductCard';

const Sunglasses = () => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Updated sample products with Nepali Rupees
  const [products] = useState([
    {
      id: 1,
      name: "Aviator Classic",
      brand: "Ray-Ban",
      price: 15999, // Price in NPR
      image: "https://example.com/aviator.jpg",
      color: "Gold",
      shape: "Aviator",
      material: "Metal",
      isNew: true
    },
    // Add more products...
  ]);

  useEffect(() => {
    let filtered = [...products];
    
    // Apply filters
    const selectedColors = searchParams.getAll("color");
    const selectedBrands = searchParams.getAll("brand");
    const selectedShapes = searchParams.getAll("shape");
    const selectedMaterials = searchParams.getAll("material");
    const priceRange = searchParams.get("price");
    const order = searchParams.get("order");

    if (selectedColors.length) {
      filtered = filtered.filter(product => selectedColors.includes(product.color));
    }

    if (selectedBrands.length) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    if (selectedShapes.length) {
      filtered = filtered.filter(product => selectedShapes.includes(product.shape));
    }

    if (selectedMaterials.length) {
      filtered = filtered.filter(product => selectedMaterials.includes(product.material));
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

    // Apply sorting
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
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

export default Sunglasses;
