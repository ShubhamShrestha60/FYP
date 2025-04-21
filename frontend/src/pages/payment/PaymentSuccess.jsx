import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(location.search);
            const pidx = params.get('pidx');
            
            try {
                await axios.post('http://localhost:5001/api/payment/khalti/verify', 
                    { pidx },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                toast.success('Payment verified successfully!');
                navigate('/order-success');
            } catch (error) {
                toast.error('Payment verification failed');
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