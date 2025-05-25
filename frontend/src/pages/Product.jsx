import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiHeart } from 'react-icons/fi';
import LensSelector from '../components/LensSelector/LensSelector';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Product = () => {
  const [showLensSelector, setShowLensSelector] = useState(false);
  const [selectedLensOptions, setSelectedLensOptions] = useState(null);
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (user) {
      checkIfFavorite();
    }
  }, [productId, user]);

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

  const checkIfFavorite = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/favorites', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsFavorite(response.data.some(fav => fav._id === productId));
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const handleAddToCart = () => {
    const productWithLens = {
      ...product,
      quantity,
      lensOptions: selectedLensOptions,
      price: (product.price || 0) + (selectedLensOptions?.price || 0)
    };
    console.log("Adding to cart:", productWithLens);
    addToCart(productWithLens);
    toast.success("Product added to cart!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error('Please login to add favorites', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:5001/api/users/favorites/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(false);
        toast.success('Removed from favorites', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await axios.post(`http://localhost:5001/api/users/favorites/${productId}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsFavorite(true);
        toast.success('Added to favorites', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast.error('Error updating favorites', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-xl text-gray-500">{product.brand}</p>
            </div>
            <button
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
              }`}
            >
              <FiHeart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
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
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
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

            {/* Try On Button - Only show for eyeglasses and sunglasses with virtual try-on images */}
            {(product.category === 'eyeglasses' || product.category === 'sunglasses') && 
             product.virtualTryOnImages && product.virtualTryOnImages.length > 0 && (
              <button
                onClick={() => navigate(`/tryon?productId=${product._id}`)}
                className="w-full py-3 px-8 rounded-md text-white bg-blue-500 hover:bg-blue-600 mb-3"
              >
                Virtual Try On
              </button>
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
