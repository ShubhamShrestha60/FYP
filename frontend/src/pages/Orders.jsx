import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock, FiDownload } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-5 h-5" />,
      processing: <FiPackage className="w-5 h-5" />,
      shipped: <FiTruck className="w-5 h-5" />,
      delivered: <FiCheckCircle className="w-5 h-5" />,
      cancelled: <FiXCircle className="w-5 h-5" />
    };
    return icons[status] || null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.post(
        `http://localhost:5001/api/orders/${orderId}/cancel`,
        { reason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/orders/${orderId}/invoice`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error('Error generating invoice');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500">Order #</span>
                      <span className="font-medium">{order._id.slice(-6)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="ml-2">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                      <p className="text-lg font-semibold">Rs. {order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p className="capitalize">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                      <p className={`capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {order.status === 'shipped' && order.trackingNumber && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <h3 className="text-sm font-medium text-blue-800">Tracking Information</h3>
                      <p className="text-sm text-blue-600">
                        Tracking Number: {order.trackingNumber}
                        {order.carrier && ` (${order.carrier})`}
                      </p>
                      {order.estimatedDelivery && (
                        <p className="text-sm text-blue-600">
                          Estimated Delivery: {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => generateInvoice(order._id)}
                      className="text-green-600 hover:text-green-800 flex items-center"
                    >
                      <FiDownload className="mr-1" /> Invoice
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && !showCancelModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Details #{selectedOrder._id.slice(-6)}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
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
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Shipping Address</h3>
                  <div className="space-y-2">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    <p>{selectedOrder.shippingAddress.postalCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
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
                        {selectedOrder.items.map((item, index) => (
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
                      <span>Rs. {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>Rs. {selectedOrder.shippingCost.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-Rs. {selectedOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>Rs. {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">Status History</h3>
                    <div className="space-y-4">
                      {selectedOrder.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className={`mt-1 ${getStatusColor(history.status)} p-2 rounded-full`}>
                            {getStatusIcon(history.status)}
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

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => generateInvoice(selectedOrder._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                  <FiDownload className="mr-2" /> Generate Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel order #{selectedOrder._id.slice(-6)}?
                This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-md p-2"
                  rows="3"
                  required
                  placeholder="Please provide a reason for cancellation"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  disabled={!cancelReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
