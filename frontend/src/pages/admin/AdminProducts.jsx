import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';
import Pagination from '../../components/common/Pagination';
import ProductFilter from '../../components/admin/ProductFilter';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'sunglasses',
    description: '',
    stock: '',
    images: [],
    virtualTryOnImages: [],
    specifications: {
      frameSize: '',
      frameWidth: '',
      material: '',
      gender: 'unisex',
      frameColor: '',
      frameShape: ''
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    name: '',
    brand: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Error fetching products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh the products list
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('spec_')) {
      const specName = name.replace('spec_', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleImageUpload = async (e, isVirtualTryOn = false) => {
    try {
      setLoading(true);
      const files = Array.from(e.target.files);
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await axiosInstance.post('/products/upload', formData);
      console.log('Upload response:', response);

      setFormData(prev => ({
        ...prev,
        [isVirtualTryOn ? 'virtualTryOnImages' : 'images']: [
          ...prev[isVirtualTryOn ? 'virtualTryOnImages' : 'images'],
          ...response.data.imageUrls
        ]
      }));
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      console.log('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Error uploading images');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ...product,
      category: product.category.toLowerCase(),
      specifications: {
        frameSize: product.specifications?.frameSize || '',
        frameWidth: product.specifications?.frameWidth || '',
        material: product.specifications?.material || '',
        gender: product.specifications?.gender || 'unisex',
        frameColor: product.specifications?.frameColor || '',
        frameShape: product.specifications?.frameShape || ''
      }
    });
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      category: formData.category.toLowerCase(),
      description: formData.description,
      stock: Number(formData.stock),
      images: formData.images,
      virtualTryOnImages: formData.virtualTryOnImages,
      specifications: {
        frameSize: formData.specifications?.frameSize || '',
        frameWidth: formData.specifications?.frameWidth || '',
        material: formData.specifications?.material || '',
        gender: formData.specifications?.gender || 'unisex',
        frameColor: formData.specifications?.frameColor || '',
        frameShape: formData.specifications?.frameShape || ''
      }
    };

    try {
      if (selectedProduct) {
        // Update existing product
        await axiosInstance.put(
          `/products/${selectedProduct._id}`,
          productData
        );
        toast.success('Product updated successfully');
      } else {
        // Create new product
        await axiosInstance.post(
          '/products',
          productData
        );
        toast.success('Product added successfully');
      }

      fetchProducts();
      setShowForm(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error saving product');
    }
  };

  const validateForm = () => {
    const requiredFields = ['name', 'brand', 'price', 'category', 'description', 'stock'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return false;
    }
    
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }

    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }

    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      toast.error('Please enter a valid stock quantity');
      return false;
    }
    
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      category: 'sunglasses',
      description: '',
      stock: '',
      images: [],
      virtualTryOnImages: [],
      specifications: {
        frameSize: '',
        frameWidth: '',
        material: '',
        gender: 'unisex',
        frameColor: '',
        frameShape: ''
      }
    });
    setSelectedProduct(null);
  };

  // Filtering logic
  const filteredProducts = products.filter(product => {
    const matchesName = filters.name === '' || product.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesBrand = filters.brand === '' || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
    const matchesCategory = filters.category === '' || product.category.toLowerCase() === filters.category.toLowerCase();
    const matchesMinPrice = filters.minPrice === '' || product.price >= Number(filters.minPrice);
    const matchesMaxPrice = filters.maxPrice === '' || product.price <= Number(filters.maxPrice);
    return matchesName && matchesBrand && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Pagination logic (use filteredProducts)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setSelectedProduct(null);
            resetForm();
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Add New Product
        </button>
      </div>

      {/* Filter Section */}
      <ProductFilter filters={filters} onFilterChange={setFilters} />

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700"
                    required
                  >
                    <option value="sunglasses">Sunglasses</option>
                    <option value="eyeglasses">Eyeglasses</option>
                    <option value="contactlens">Contact Lens</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  required
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, false)}
                  className="mt-1 block w-full"
                />
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Virtual Try-On Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Virtual Try-On Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, true)}
                  className="mt-1 block w-full"
                />
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {formData.virtualTryOnImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Virtual Try-On ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            virtualTryOnImages: prev.virtualTryOnImages.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frame Size</label>
                  <input
                    type="text"
                    name="spec_frameSize"
                    value={formData.specifications.frameSize}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frame Width</label>
                  <input
                    type="text"
                    name="spec_frameWidth"
                    value={formData.specifications.frameWidth}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="spec_gender"
                    value={formData.specifications.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="baby">Baby</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Material</label>
                  <select
                    name="spec_material"
                    value={formData.specifications.material}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Select Material</option>
                    <option value="acetate">Acetate</option>
                    <option value="metal">Metal</option>
                    <option value="titanium">Titanium</option>
                    <option value="plastic">Plastic</option>
                    <option value="mixed">Mixed Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frame Color</label>
                  <select
                    name="spec_frameColor"
                    value={formData.specifications.frameColor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Color</option>
                    <option value="Black">Black</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Brown">Brown</option>
                    <option value="Blue">Blue</option>
                    <option value="Green">Green</option>
                    <option value="Pink">Pink</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frame Shape</label>
                  <select
                    name="spec_frameShape"
                    value={formData.specifications.frameShape}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  >
                    <option value="">Select Shape</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Round">Round</option>
                    <option value="Square">Square</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Cat Eye">Cat Eye</option>
                    <option value="Oval">Oval</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {selectedProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No products found
                </td>
              </tr>
            ) : (
              currentItems.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => {
                        handleEdit(product);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default AdminProducts;