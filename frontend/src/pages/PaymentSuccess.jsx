import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const pidx = params.get('pidx');
                const status = params.get('status');
                
                // Get stored order details from localStorage
                const pendingOrder = JSON.parse(localStorage.getItem('pending_order') || '{}');
                
                if (!pidx) {
                    throw new Error('Payment ID not found');
                }

                if (!pendingOrder.orderId) {
                    throw new Error('Order details not found. Please contact support.');
                }

                if (status !== 'Completed') {
                    throw new Error('Payment was not completed successfully');
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication token not found. Please log in again.');
                }

                console.log('Verifying payment with:', { pidx, orderId: pendingOrder.orderId });

                const response = await axios.post(
                    'http://localhost:5001/api/payment/khalti/verify',
                    {
                        pidx,
                        orderId: pendingOrder.orderId
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data && response.data.status === 'success') {
                    // Clear stored order details
                    localStorage.removeItem('pending_order');
                    toast.success('Payment verified successfully!');
                    navigate(`/order-success/${pendingOrder.orderId}`);
                } else {
                    throw new Error(response.data?.message || 'Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
                setError(errorMessage);
                toast.error(errorMessage);
                // Don't navigate away immediately, let the user see the error
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [location, navigate]);

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Verifying Payment</h2>
                    <p className="text-gray-600 mb-4">Please wait while we verify your payment...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Verification Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/cart')}
                            className="block w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                        >
                            Return to Cart
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="block w-full border border-blue-500 text-blue-500 px-6 py-2 rounded-lg hover:bg-blue-50"
                        >
                            View Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default PaymentSuccess;