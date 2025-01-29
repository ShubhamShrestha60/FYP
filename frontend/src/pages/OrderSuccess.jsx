import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const OrderSuccess = () => {
  const { orderId } = useParams();

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
          <Link
            to={`/order/${orderId}`}
            className="block w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-50"
          >
            View Order Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 