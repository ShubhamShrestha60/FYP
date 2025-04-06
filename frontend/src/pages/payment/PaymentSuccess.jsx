import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Utility function for token management
const getAuthToken = () => {
    return localStorage.getItem('token');
};

const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        localStorage.removeItem('token');
        return null;
    }
    
    try {
        const response = await axios.post('http://localhost:5001/api/auth/refresh-token', 
            { refreshToken },
            { 
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }
        );
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            return response.data.token;
        }
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return null;
    }
};

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [verificationStatus, setVerificationStatus] = useState('verifying');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const pidx = params.get('pidx');
                const status = params.get('status');

                if (!pidx) {
                    throw new Error('Invalid payment verification request');
                }

                const pendingOrder = JSON.parse(localStorage.getItem('pending_order'));
                if (!pendingOrder) {
                    throw new Error('Order details not found');
                }

                let token = getAuthToken();
                if (!token) {
                    console.log('No auth token found, redirecting to login...');
                    handleAuthFailure(pidx, pendingOrder.orderId);
                    return;
                }

                // Validate token before making the request
                try {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    if (Date.now() >= tokenData.exp * 1000) {
                        console.log('Token expired, attempting refresh...');
                        const newToken = await refreshAuthToken();
                        if (!newToken) {
                            handleAuthFailure(pidx, pendingOrder.orderId);
                            return;
                        }
                        token = newToken;
                    }
                } catch (tokenError) {
                    console.error('Token validation error:', tokenError);
                    handleAuthFailure(pidx, pendingOrder.orderId);
                    return;
                }

                console.log('Proceeding with payment verification...');

                console.log('Sending payment verification request...');
                const response = await axios.post(
                    'http://localhost:5001/api/payment/khalti/verify',
                    { pidx, orderId: pendingOrder.orderId },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000
                    }
                );

                console.log('Payment verification response:', response.data);
                if (response.data?.status === 'Completed' || status === 'Completed') {
                    handlePaymentSuccess(pendingOrder.orderId);
                } else {
                    throw new Error('Payment verification failed: ' + (response.data?.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                if (error.response?.status === 401) {
                    console.log('Authentication error detected, checking context...');
                    const pidx = new URLSearchParams(location.search).get('pidx');
                    const pendingOrder = JSON.parse(localStorage.getItem('pending_order'));
                    if (pidx && pendingOrder) {
                        console.log('Context available, handling auth failure...');
                        handleAuthFailure(pidx, pendingOrder.orderId);
                    } else {
                        console.log('No context available, general auth error...');
                        handlePaymentError('Authentication failed');
                    }
                } else if (error.response?.status === 404) {
                    console.error('Payment verification endpoint not found');
                    handlePaymentError('Payment verification service is currently unavailable');
                } else if (error.response?.status === 400) {
                    console.error('Invalid payment data:', error.response?.data);
                    handlePaymentError('Invalid payment information. Please try again');
                } else if (error.response?.status === 408 || error.code === 'ECONNABORTED') {
                    console.error('Payment verification timeout');
                    handlePaymentError('Payment verification timed out. Please check your order status');
                } else {
                    console.error('Payment verification error:', error.response?.data || error.message);
                    handlePaymentError(
                        'Unable to verify payment. Please contact support if the issue persists.'
                    );
                }
            }
        };

        const handleAuthFailure = (pidx, orderId) => {
            setVerificationStatus('failed');
            toast.error('Session expired. Please login again.');
            // Store payment verification data for post-login processing
            const params = new URLSearchParams(location.search);
            localStorage.setItem('redirect_after_login', JSON.stringify({
                type: 'payment_verification',
                pidx,
                orderId,
                status: params.get('status'),
                timestamp: Date.now()
            }));
            // Redirect to login with return URL and payment context
            setTimeout(() => navigate('/login', { 
                state: { 
                    returnUrl: '/payment/success',
                    paymentContext: { pidx, orderId }
                } 
            }), 2000);
        };

        const handlePaymentSuccess = (orderId) => {
            setVerificationStatus('success');
            toast.success('Payment successful! Redirecting to order details...');
            // Clean up stored payment data
            localStorage.removeItem('pending_order');
            localStorage.removeItem('redirect_after_login');
            // Redirect to order success page with orderId
            setTimeout(() => navigate(`/order-success/${orderId}`), 2000);
        };

        const handlePaymentError = (message) => {
            setVerificationStatus('failed');
            const errorMsg = message || 'Payment verification failed. Please try again or contact support.';
            toast.error(errorMsg);
            console.error('Payment verification error:', errorMsg);
            // Clean up any stored payment data on error
            localStorage.removeItem('pending_order');
            setTimeout(() => navigate('/cart'), 2000);
        };

        verifyPayment();
    }, [navigate, location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                {verificationStatus === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
                        <h2 className="mt-6 text-2xl font-semibold text-gray-800">Verifying Your Payment</h2>
                        <p className="mt-3 text-gray-600">Please wait while we process your transaction...</p>
                    </>
                )}
                {verificationStatus === 'success' && (
                    <>
                        <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <span className="text-green-500 text-5xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Payment Successful!</h2>
                        <p className="mt-3 text-gray-600">Your order has been confirmed.</p>
                        <p className="mt-2 text-sm text-gray-500">Redirecting to your order details...</p>
                    </>
                )}
                {verificationStatus === 'failed' && (
                    <>
                        <div className="bg-red-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <span className="text-red-500 text-5xl">×</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700">Payment Failed</h2>
                        <p className="mt-2 text-gray-500">Redirecting to cart...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                {verificationStatus === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
                        <h2 className="mt-6 text-2xl font-semibold text-gray-800">Verifying Your Payment</h2>
                        <p className="mt-3 text-gray-600">Please wait while we process your transaction...</p>
                    </>
                )}
                {verificationStatus === 'success' && (
                    <>
                        <div className="bg-green-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <span className="text-green-500 text-5xl">✓</span>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Payment Successful!</h2>
                        <p className="mt-3 text-gray-600">Your order has been confirmed.</p>
                        <p className="mt-2 text-sm text-gray-500">Redirecting to your order details...</p>
                    </>
                )}
                {verificationStatus === 'failed' && (
                    <>
                        <div className="bg-red-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
                            <span className="text-red-500 text-5xl">×</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700">Payment Failed</h2>
                        <p className="mt-2 text-gray-500">Redirecting to orders...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;