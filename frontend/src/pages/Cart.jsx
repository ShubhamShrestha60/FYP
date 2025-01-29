import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Link to="/collection" className="text-red-600 hover:text-red-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.brand}</p>
                    <p className="text-red-600 font-semibold">Rs. {item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FiPlus />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-1 rounded-full hover:bg-gray-100 text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>Rs. {getCartTotal().toFixed(2)}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between mb-4">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">Rs. {getCartTotal().toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
