const axios = require('axios');
const Order = require('../../models/Order');

const initiatePayment = async (req, res) => {
    try {
        console.log('Initiating Khalti payment with data:', {
            ...req.body,
            amount: req.body.amount,
            purchase_order_id: req.body.purchase_order_id
        });

        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            req.body,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Khalti initiation response:', response.data);
        
        if (response.data && response.data.payment_url) {
            res.json(response.data);
        } else {
            console.error('Invalid response from Khalti:', response.data);
            res.status(400).json({ error: 'Payment URL not received from Khalti', details: response.data });
        }
    } catch (error) {
        console.error('Khalti payment initiation error:', error.response?.data || error.message);
        res.status(400).json({ 
            error: 'Payment initiation failed', 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { pidx, orderId } = req.body;
        console.log('Verifying Khalti payment:', { pidx, orderId });

        let retries = 3;
        let lastError;
        let response;

        while (retries > 0) {
            try {
                response = await axios.post(
                    'https://a.khalti.com/api/v2/epayment/verify/',
                    { pidx },
                    {
                        headers: {
                            'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 15000 // 15 seconds timeout
                    }
                );

                console.log('Khalti verification response:', response.data);

                if (response.data.status === 'Completed') {
                    // Verify order ID matches
                    if (response.data.purchase_order_id !== orderId) {
                        throw new Error('Order ID mismatch');
                    }
                    break;
                } else {
                    throw new Error(`Payment not completed. Status: ${response.data.status}`);
                }
            } catch (error) {
                lastError = error;
                console.error(`Verification attempt ${4-retries}/3 failed:`, error.message);
                retries--;

                if (retries > 0) {
                    // Exponential backoff: 2s, 4s, 8s
                    const delay = 2000 * Math.pow(2, 3-retries);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw lastError;
                }
            }
        }

        // Update order payment status and send success response
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paymentMethod: 'khalti',
            transactionId: response.data.transaction_id,
            status: 'processing'
        }, { new: true });

        if (!updatedOrder) {
            throw new Error('Order not found');
        }

        // Send success response with order details
        const successResponse = {
            status: 'success',
            message: 'Payment verified successfully',
            order: {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                paymentStatus: updatedOrder.paymentStatus,
                transactionId: updatedOrder.transactionId
            },
            payment: response.data
        };

        res.json(response.data);
    } catch (error) {
        console.error('Khalti payment initiation error:', error.response?.data || error.message);
        res.status(400).json({ 
            error: 'Payment initiation failed', 
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
};

module.exports = { initiatePayment, verifyPayment };