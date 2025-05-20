import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import KhaltiPayment from '../components/payment/KhaltiPayment';
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
    setLoading(true);
    
    try {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = subtotal; // No shipping cost
  
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
          postalCode: formData.postalCode || '', // Make postal code optional
          country: formData.country
        },
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          lensOptions: item.lensOptions ? {
            type: item.lensOptions.type,
            coating: item.lensOptions.coating,
            prescription: item.lensOptions.prescription?._id,
            price: item.lensOptions.price || 0
          } : null
        })),
        subtotal,
        shippingCost: 0, // Free shipping
        total,
        paymentMethod: formData.paymentMethod
      };
  
      // Create order first
      const orderResponse = await axios.post('http://localhost:5001/api/orders', orderData);
      const orderId = orderResponse.data._id;
  
      if (formData.paymentMethod === 'khalti') {
        try {
          // Store order details in localStorage for recovery
          localStorage.setItem('pending_order', JSON.stringify({
            orderId,
            amount: total,
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            }
          }));

          // Initiate Khalti payment
          const khaltiResponse = await axios.post('http://localhost:5001/api/payment/khalti/initiate', {
            amount: total * 100, // Convert to paisa
            purchase_order_id: orderId,
            purchase_order_name: `Order #${orderId}`,
            customer_info: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            },
            return_url: `${window.location.origin}/payment/success`,
            website_url: window.location.origin
          }, {
            timeout: 10000 // Set timeout to 10 seconds
          });
          
          if (!khaltiResponse.data || !khaltiResponse.data.payment_url) {
            throw new Error('Invalid payment URL received from Khalti');
          }

          // Redirect to Khalti payment page
          window.location.href = khaltiResponse.data.payment_url;
        } catch (paymentError) {
          console.error('Khalti payment error:', paymentError);
          if (paymentError.code === 'ECONNRESET' || paymentError.code === 'ETIMEDOUT') {
            toast.error('Payment service temporarily unavailable. Please try again.');
          } else {
            toast.error(paymentError.message || 'Failed to initiate payment. Please try again.');
          }
          // Remove pending order from localStorage
          localStorage.removeItem('pending_order');
        }
      } else {
        // For COD, just clear cart and redirect
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Return null while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Billing Details */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Billing Details</h2>
              <div>
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

              {/* Add error message display */}
              {error && (
                <div className="text-red-600 mb-4 text-center">
                  {error}
                </div>
              )}
            </div>
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
              <div className="mb-6 space-y-4">
                <h3 className="font-medium text-gray-900">Payment Method</h3>
                
                {/* Cash on Delivery */}
                <div className="relative flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    id="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3 flex flex-col cursor-pointer">
                    <span className="block text-sm font-medium text-gray-900">Cash on Delivery</span>
                    <span className="block text-sm text-gray-500">Pay with cash when your order arrives</span>
                  </label>
                </div>

                {/* Khalti Payment */}
                <div className="relative flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="khalti"
                    id="khalti"
                    checked={formData.paymentMethod === 'khalti'}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="khalti" className="ml-3 flex flex-col cursor-pointer">
                    <span className="block text-sm font-medium text-gray-900">Khalti</span>
                    <span className="block text-sm text-gray-500">Pay securely using Khalti digital wallet</span>
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
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-gray-400' : formData.paymentMethod === 'khalti' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-3 rounded transition-colors`}
              >
                {loading ? 'Processing...' : formData.paymentMethod === 'khalti' ? 'Pay with Khalti' : 'PLACE ORDER'}
              </button>
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;