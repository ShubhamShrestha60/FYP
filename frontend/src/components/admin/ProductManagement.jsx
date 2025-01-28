import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Add base URL constant
const API_BASE_URL = 'http://localhost:5001/api';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    category: '',
    frameType: '',
    stock: '',
    images: [],
    specifications: {
      frameSize: '',
      frameWidth: '',
      lensWidth: '',
      bridgeWidth: '',
      templeLength: '',
      material: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return [];
    
    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/products/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploading(false);
      return response.data.imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploading(false);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrls = await uploadImages();
      
      const productData = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        description: formData.description || 'No description provided',
        category: formData.category,
        frameType: formData.frameType || 'Standard',
        stock: Number(formData.stock) || 0,
        images: imageUrls,
        specifications: {
          frameSize: formData.specifications?.frameSize || '',
          frameWidth: formData.specifications?.frameWidth || '',
          lensWidth: formData.specifications?.lensWidth || '',
          bridgeWidth: formData.specifications?.bridgeWidth || '',
          templeLength: formData.specifications?.templeLength || '',
          material: formData.specifications?.material || ''
        }
      };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/products/${editId}`, productData);
      } else {
        const response = await axios.post(`${API_BASE_URL}/products`, productData);
        console.log('Product creation response:', response.data);
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error details:', error.response?.data);
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setFormData(product);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      description: '',
      category: '',
      frameType: '',
      stock: '',
      images: [],
      specifications: {
        frameSize: '',
        frameWidth: '',
        lensWidth: '',
        bridgeWidth: '',
        templeLength: '',
        material: ''
      }
    });
    setIsEditing(false);
    setEditId(null);
    setSelectedFiles([]);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>
      
      {/* Product Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              <option value="Sunglasses">Sunglasses</option>
              <option value="Eyeglasses">Eyeglasses</option>
              <option value="Contact Lenses">Contact Lenses</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          {/* Add more form fields for other product details */}
        </div>
        
        <div className="mt-4">
          <label className="block mb-2">Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border rounded"
          />
          {uploading && <p className="text-blue-500">Uploading images...</p>}
        </div>
        
        {/* Display selected images preview */}
        <div className="mt-4 flex gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="w-24 h-24">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
        
        <button 
          type="submit" 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isEditing ? 'Update Product' : 'Add Product'}
        </button>
        
        {isEditing && (
          <button 
            type="button" 
            onClick={resetForm}
            className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600">{product.brand}</p>
            <p className="text-green-600">${product.price}</p>
            <div className="mt-2">
              <button
                onClick={() => handleEdit(product)}
                className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement; 