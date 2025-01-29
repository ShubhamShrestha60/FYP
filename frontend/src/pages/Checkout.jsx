import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if cart is empty using useEffect
  React.useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cod'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = 150;
      const total = subtotal + shippingCost;

      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal,
        shippingCost,
        total,
        paymentMethod: 'cod'  // Default to COD for now
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('http://localhost:5001/api/orders', orderData);
      console.log('Order response:', response.data);

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${response.data._id}`);
      
    } catch (error) {
      console.error('Order error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error placing order');
    }
  };

  if (cart.length === 0) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billing Details */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Billing Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">First name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">Email address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Street address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="House number and street name"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Town / City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">State / Zone *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Postcode / ZIP (optional)</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Country / Region *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Ship To A Different Address?
                </label>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                <a href="/privacy-policy" className="text-blue-600">Privacy policy</a>.
              </div>

              {/* Add error message display */}
              {error && (
                <div className="text-red-600 mb-4 text-center">
                  {error}
                </div>
              )}

              {/* Update the form and button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-3 rounded transition-colors`}
              >
                {loading ? 'Processing...' : 'PLACE ORDER'}
              </button>
            </form>
          </div>

          {/* Your Order */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Your Order</h2>
            <div className="bg-white p-6 rounded shadow">
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-4">Product</th>
                    <th className="text-right pb-4">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item._id} className="border-b">
                      <td className="py-4">
                        {item.name} × {item.quantity}
                      </td>
                      <td className="text-right py-4">
                        Rs {(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b">
                    <td className="py-4">Subtotal</td>
                    <td className="text-right py-4">Rs {getCartTotal().toFixed(2)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4">Shipping</td>
                    <td className="text-right py-4">Free shipping</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-semibold">Total</td>
                    <td className="text-right py-4 font-semibold">
                      Rs {getCartTotal().toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Methods */}
              <div className="mb-6">
                {/* Cash on Delivery */}
                <div className="mb-4">
                  <label className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Cash on delivery</span>
                  </label>
                  {formData.paymentMethod === 'cod' && (
                    <div className="ml-6 text-gray-600 bg-gray-100 p-3 rounded">
                      Pay with cash upon delivery.
                    </div>
                  )}
                </div>

                {/* eSewa */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="esewa"
                      checked={formData.paymentMethod === 'esewa'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>eSewa</span>
                  </label>
                </div>

                {/* Card Payment */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>Visa/Master Card</span>
                  </label>
                </div>
              </div>

              {/* Privacy Policy */}
              <div className="text-sm text-gray-600 mb-6">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                <a href="/privacy-policy" className="text-blue-600">
                  Privacy policy
                </a>
                .
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 