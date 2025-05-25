import React from 'react';

const ProductFilter = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({ name: '', brand: '', category: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
          placeholder="Product name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
        <input
          type="text"
          name="brand"
          value={filters.brand}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
          placeholder="Brand"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-40"
        >
          <option value="">All</option>
          <option value="sunglasses">Sunglasses</option>
          <option value="eyeglasses">Eyeglasses</option>
          <option value="contactlens">Contact Lens</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-28"
          placeholder="Min"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-28"
          placeholder="Max"
          min="0"
        />
      </div>
      <button
        className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        type="button"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
};

export default ProductFilter; 