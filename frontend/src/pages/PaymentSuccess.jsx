import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { khaltiService } from '../services/khaltiService';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(location.search);
            const pidx = params.get('pidx');
            const paymentStatus = params.get('status');
            
            // Get stored payment details
            const paymentDetails = JSON.parse(localStorage.getItem('khalti_payment_details') || '{}');
            
            try {
                if (!pidx || paymentStatus !== 'Completed') {
                    throw new Error('Payment was not completed');
                }
                
                const response = await khaltiService.verifyPayment({ 
                    pidx,
                    orderId: paymentDetails.orderId
                });
                
                // Clear payment details from localStorage
                localStorage.removeItem('khalti_payment_details');
                
                toast.success('Payment verified successfully!');
                navigate('/order-confirmation');
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error(error.message || 'Payment verification failed');
                navigate('/cart');
            }
        };

        verifyPayment();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Verifying Payment...</h2>
                <p>Please wait while we verify your payment.</p>
            </div>
        </div>
    );
};

export default PaymentSuccess;