import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      <p className="text-gray-600">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                        {order.shippingAddress.postalCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Order Summary</h3>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>Rs. {order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>Rs. {order.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>Rs. {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="overflow-x-auto">
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
                              <td className="px-4 py-2">{item.product.name}</td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">Rs. {item.price.toFixed(2)}</td>
                              <td className="px-4 py-2">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
