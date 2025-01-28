import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';

function ProductNav() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState(searchParams.get("order") || "");
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  
  // Get filter values from URL params
  const selectedColors = searchParams.getAll("color");
  const selectedBrands = searchParams.getAll("brand");
  const selectedSizes = searchParams.getAll("size");
  const selectedShapes = searchParams.getAll("shape");
  const selectedMaterials = searchParams.getAll("material");
  const priceRange = searchParams.get("price") || "all";

  // Updated price ranges for Nepali Rupees
  const filterOptions = {
    colors: ["Black", "Gold", "Silver", "Brown", "Blue", "Green", "Pink"],
    brands: ["Ray-Ban", "Oakley", "Gucci", "Prada", "Tom Ford", "Persol"],
    shapes: ["Aviator", "Round", "Square", "Rectangle", "Cat Eye", "Oval"],
    sizes: ["Small", "Medium", "Large", "Extra Large"],
    materials: ["Metal", "Plastic", "Acetate", "Titanium"],
    priceRanges: [
      { label: "All", value: "all" },
      { label: "Under Rs. 5,000", value: "0-5000" },
      { label: "Rs. 5,000 - Rs. 10,000", value: "5000-10000" },
      { label: "Rs. 10,000 - Rs. 20,000", value: "10000-20000" },
      { label: "Over Rs. 20,000", value: "20000+" }
    ]
  };

  // Function to get current category from path
  const getCurrentCategory = () => {
    const path = location.pathname;
    if (path.includes('sunglasses')) return 'SUNGLASSES';
    if (path.includes('eyeglasses')) return 'EYEGLASSES';
    if (path.includes('contactlens')) return 'CONTACT LENSES';
    if (path.includes('collection')) return 'COLLECTION';
    return '';
  };

  const handleFilterChange = (type, value) => {
    const params = new URLSearchParams(searchParams);
    const currentValues = params.getAll(type);
    
    if (currentValues.includes(value)) {
      const newValues = currentValues.filter(v => v !== value);
      params.delete(type);
      newValues.forEach(v => params.append(type, v));
    } else {
      params.append(type, value);
    }
    
    setSearchParams(params);
  };

  const handlePriceChange = (range) => {
    const params = new URLSearchParams(searchParams);
    params.set("price", range);
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    setOrder(e.target.value);
    const params = new URLSearchParams(searchParams);
    params.set("order", e.target.value);
    setSearchParams(params);
  };

  return (
    <div className="sticky top-[64px] z-10">
      {/* Main Navigation Bar */}
      <div className="bg-gray-100 h-16 px-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded"
          >
            <FiFilter />
            Filters
          </button>
          <h1 className="text-gray-600 font-light hidden md:block">
            {showFilters ? "Select Filters" : getCurrentCategory()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <select
            onChange={handleSortChange}
            value={order}
            className="bg-white border border-gray-300 rounded p-2"
          >
            <option value="">Best Sellers</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex mt-[64px]">
          <div className="w-80 bg-white h-[calc(100vh-64px)] overflow-y-auto shadow-lg p-4">
            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price Range</h3>
              {filterOptions.priceRanges.map(range => (
                <div key={range.value} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price"
                      value={range.value}
                      checked={priceRange === range.value}
                      onChange={() => handlePriceChange(range.value)}
                      className="mr-2"
                    />
                    {range.label}
                  </label>
                </div>
              ))}
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Brands</h3>
              {filterOptions.brands.map(brand => (
                <div key={brand} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleFilterChange('brand', brand)}
                      className="mr-2"
                    />
                    {brand}
                  </label>
                </div>
              ))}
            </div>

            {/* Frame Shapes */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Frame Shape</h3>
              {filterOptions.shapes.map(shape => (
                <div key={shape} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedShapes.includes(shape)}
                      onChange={() => handleFilterChange('shape', shape)}
                      className="mr-2"
                    />
                    {shape}
                  </label>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Frame Color</h3>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.colors.map(color => (
                  <div key={color} className="mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => handleFilterChange('color', color)}
                        className="mr-2"
                      />
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Frame Material</h3>
              {filterOptions.materials.map(material => (
                <div key={material} className="mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material)}
                      onChange={() => handleFilterChange('material', material)}
                      className="mr-2"
                    />
                    {material}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div 
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          ></div>
        </div>
      )}
    </div>
  );
}

export default ProductNav;
