import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KhaltiPayment from '../components/payment/KhaltiPayment';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Get order details from location state
        const details = location.state?.orderDetails;
        if (!details) {
            toast.error('Order details not found');
            navigate('/cart');
            return;
        }
        setOrderDetails(details);
    }, [location, navigate]);

    if (!orderDetails) {
        return <div className="text-center p-4">Loading order details...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="mb-2">Order Total: Rs. {orderDetails.totalAmount}</p>
                <p className="mb-2">Order ID: {orderDetails.orderId}</p>
            </div>
            <KhaltiPayment 
                amount={orderDetails.totalAmount}
                orderId={orderDetails.orderId}
                productName="Order Payment"
            />
        </div>
    );

}

export default PlaceOrder;