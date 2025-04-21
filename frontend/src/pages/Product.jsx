import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import LensSelector from '../components/LensSelector/LensSelector';

const Product = () => {
  const [showLensSelector, setShowLensSelector] = useState(false);
  const [selectedLensOptions, setSelectedLensOptions] = useState(null);
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (['eyeglasses', 'sunglasses'].includes(product.category) && !selectedLensOptions) {
      alert('Please select lens options before adding to cart');
      return;
    }

    const productWithLens = {
      ...product,
      quantity,
      lensOptions: selectedLensOptions
    };
    addToCart(productWithLens);
    alert('Product added to cart!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover object-center rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-w-1 aspect-h-1 ${
                  selectedImage === index ? 'ring-2 ring-red-600' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover object-center rounded"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-xl text-gray-500">{product.brand}</p>
          </div>

          <p className="text-2xl font-bold text-red-600">Rs. {product.price}</p>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications || {}).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity:
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Lens Selection Section */}
            {['eyeglasses', 'sunglasses'].includes(product.category) && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">Lens Options</h3>
                    <p className="text-sm text-gray-600">
                      {selectedLensOptions
                        ? 'Selected lens and coating'
                        : 'Select your prescription and lens options'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLensSelector(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {selectedLensOptions ? 'Change Options' : 'Select Options'}
                  </button>
                </div>

                {selectedLensOptions && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Lens Type</p>
                        <p className="font-medium">{selectedLensOptions.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Coating</p>
                        <p className="font-medium">{selectedLensOptions.coating}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-600">Additional Cost</p>
                        <p className="font-medium text-red-600">
                          + Rs. {selectedLensOptions.price?.toLocaleString() || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total Price Section */}
            {selectedLensOptions && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Price</span>
                  <span className="text-2xl font-bold text-red-600">
                    Rs. {((product.price || 0) + (selectedLensOptions.price || 0)) * quantity}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 px-8 rounded-md text-white ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Lens Selector Modal */}
      {showLensSelector && (
        <LensSelector
          onClose={() => setShowLensSelector(false)}
          onSelectLens={(options) => {
            setSelectedLensOptions(options);
            setShowLensSelector(false);
          }}
        />
      )}
    </div>
  );
};

export default Product;
