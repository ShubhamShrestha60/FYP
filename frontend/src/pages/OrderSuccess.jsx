import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { clearCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line
  }, []);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrder(response.data);
      setShowModal(true);
    } catch (err) {
      setError('Failed to fetch order details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-4">
          Thank you for your order. Your order ID is: {orderId}
        </p>
        <p className="text-gray-600 mb-6">
          We'll send you an email confirmation with order details and tracking information.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
          <button
            onClick={fetchOrder}
            className="block w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'View Order Details'}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && order && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Order Details #{order._id.slice(-6)}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Customer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                </div>
              </div>
              {/* Shipping Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Shipping Address</h3>
                <div className="space-y-2">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
              {/* Order Items */}
              <div className="col-span-1 md:col-span-2 space-y-4">
                <h3 className="font-semibold text-lg">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            {item.product.name}
                            {item.lensOptions && item.lensOptions.type && (
                              <div className="mt-1 text-xs text-gray-600">
                                <div>Lens Type: <span className="font-semibold">{item.lensOptions.type}</span></div>
                                {item.lensOptions.coating && (
                                  <div>Coating: <span className="font-semibold">{item.lensOptions.coating}</span></div>
                                )}
                                {item.lensOptions.price > 0 && (
                                  <div>Lens Price: <span className="font-semibold">Rs. {item.lensOptions.price}</span></div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">Rs. {item.price.toFixed(2)}</td>
                          <td className="px-4 py-2">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Order Summary */}
              <div className="col-span-1 md:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>Rs. {order.shippingCost.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-Rs. {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>Rs. {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  <h3 className="font-semibold text-lg mb-4">Status History</h3>
                  <div className="space-y-4">
                    {order.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="mt-1 bg-gray-100 p-2 rounded-full">
                          {/* You can add status icons/colors here if needed */}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{history.status}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(history.changedAt)}
                            {history.reason && ` - ${history.reason}`}
                          </p>
                          {history.metadata && (
                            <div className="mt-1 text-sm text-gray-600">
                              {history.metadata.trackingNumber && (
                                <p>Tracking: {history.metadata.trackingNumber}</p>
                              )}
                              {history.metadata.carrier && (
                                <p>Carrier: {history.metadata.carrier}</p>
                              )}
                              {history.metadata.estimatedDelivery && (
                                <p>Estimated Delivery: {formatDate(history.metadata.estimatedDelivery)}</p>
                              )}
                              {history.metadata.notes && (
                                <p>Notes: {history.metadata.notes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess; 