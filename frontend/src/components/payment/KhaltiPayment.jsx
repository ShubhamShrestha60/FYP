import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const KhaltiPayment = ({ amount, orderId, productName }) => {
    const navigate = useNavigate();

    const handlePayment = async () => {
        try {
            console.log('Initiating Khalti payment...', { amount, orderId, productName });
            
            const response = await axios.post('http://localhost:5001/api/payment/khalti/initiate', {
                return_url: `${window.location.origin}/payment/success`,
                website_url: window.location.origin,
                amount: amount * 100, // Convert to paisa
                purchase_order_id: orderId,
                purchase_order_name: productName,
                merchant_extra: JSON.stringify({ orderId }),
                customer_info: {
                    name: localStorage.getItem('userName'),
                    email: localStorage.getItem('userEmail'),
                    phone: localStorage.getItem('userPhone')
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('Payment initiation response:', response.data);

            if (response.data && response.data.payment_url) {
                // Store payment details in localStorage for verification
                localStorage.setItem('khalti_payment_details', JSON.stringify({
                    orderId,
                    amount
                }));
                
                // Redirect to Khalti payment page
                window.location.href = response.data.payment_url;
            } else {
                throw new Error('Invalid payment URL received');
            }
        } catch (error) {
            console.error('Payment initiation error:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Payment initiation failed. Please try again.');
        }
    };

    return (
        <button 
            onClick={handlePayment}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
            Pay with Khalti
        </button>
    );
};

export default KhaltiPayment;